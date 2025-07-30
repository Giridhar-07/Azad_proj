import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const server = http.createServer((req, res) => {
  console.log(`Request for ${req.url}`);
  
  // Handle requests for /@vite/client and other Vite-specific paths
  if (req.url.startsWith('/@vite/')) {
    res.writeHead(404);
    res.end('Vite client not available in simple server mode');
    return;
  }
  
  // Serve index.pure.html for root requests
  if (req.url === '/' || req.url === '/index.html' || req.url.startsWith('/?')) {
    const filePath = path.join(__dirname, 'index.pure.html');
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error loading index.pure.html: ${err.message}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Handle requests for src files
  if (req.url.startsWith('/src/')) {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end(`File not found: ${req.url}`);
        return;
      }
      
      let contentType = 'text/plain';
      if (req.url.endsWith('.css')) {
        contentType = 'text/css';
      } else if (req.url.endsWith('.js')) {
        contentType = 'text/javascript';
      } else if (req.url.endsWith('.tsx') || req.url.endsWith('.ts')) {
        contentType = 'application/typescript';
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
    return;
  }
  
  // Default 404 response
  res.writeHead(404);
  res.end(`File not found: ${req.url}`);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});