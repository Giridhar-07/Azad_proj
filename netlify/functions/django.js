const serverless = require('serverless-http');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');

const app = express();

let djangoReady = false;

function startDjango() {
  return new Promise((resolve, reject) => {
    if (djangoReady) {
      return resolve();
    }

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const djangoProcess = spawn(pythonCmd, ['manage.py', 'runserver', '0.0.0.0:8000'], {
      cwd: path.resolve(__dirname, '../../backend'), // Ensure Django runs in the correct directory
      env: process.env,
      stdio: 'pipe' // Use pipe to capture output
    });

    djangoProcess.stdout.on('data', (data) => {
      console.log(`Django stdout: ${data}`);
      if (data.toString().includes('Starting development server at')) {
        console.log('Django server is ready.');
        djangoReady = true;
        resolve();
      }
    });

    djangoProcess.stderr.on('data', (data) => {
      console.error(`Django stderr: ${data}`);
    });

    djangoProcess.on('close', (code) => {
      console.log(`Django process exited with code ${code}`);
      djangoReady = false; // Reset status if process dies
      if (code !== 0) {
        reject(new Error(`Django process exited with code ${code}`))
      }
    });

    djangoProcess.on('error', (err) => {
      console.error('Failed to start Django process:', err);
      reject(err);
    });
  });
}

// Middleware to ensure Django is running before proxying
const ensureDjangoIsRunning = async (req, res, next) => {
  try {
    await startDjango();
    next();
  } catch (error) {
    console.error('Error starting Django:', error);
    res.status(500).send('Failed to start Django server.');
  }
};

// Serve static files from the 'staticfiles' directory
app.use('/static', express.static(path.join(__dirname, '../../staticfiles')));
app.use('/media', express.static(path.join(__dirname, '../../media')));

// Proxy all other requests to the Django server
app.use('/', ensureDjangoIsRunning, createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  ws: true, // proxy websockets
  onProxyReq: (proxyReq, req, res) => {
    // You can add custom logic here, for example, adding headers
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(502).send('Proxy error');
  }
}));

module.exports.handler = serverless(app);
