// Netlify function to serve Django application
const serverless = require('serverless-http');
const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

// Create express app
const app = express();

// Serve static files
app.use('/static', express.static(path.join(__dirname, '../../staticfiles')));
app.use('/media', express.static(path.join(__dirname, '../../media')));

// Proxy requests to Django
app.all('*', (req, res) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()');
  
  // Run Django process
  const django = spawn('python', ['manage.py', 'runserver', '0.0.0.0:8000']);
  
  let data = '';
  django.stdout.on('data', (chunk) => {
    data += chunk.toString();
  });
  
  django.stderr.on('data', (chunk) => {
    console.error(chunk.toString());
  });
  
  django.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).send('Django server error');
    }
    res.send(data);
  });
});

// Export handler function
module.exports.handler = serverless(app);