// Development server using Vite

import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import { readFileSync } from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define port
const PORT = process.env.PORT || 3000;

// Create a custom plugin to handle Django template variables
function djangoTemplatePlugin() {
  // Generate a consistent nonce for the session
  const nonce = Math.random().toString(36).substring(2, 15);
  
  return {
    name: 'vite-plugin-django-template',
    // This ensures our plugin runs before other plugins
    enforce: 'pre',
    
    // Process HTML files
    transformIndexHtml(html) {
      // Replace Django template variables with development values
      return html
        // Remove {% load static %} tags
        .replace(/\{%\s*load\s+static\s*%\}/g, '')
        
        // Handle {% if is_debug %} ... {% else %} ... {% endif %} blocks - keep the debug content
        .replace(/\{%\s*if\s+is_debug\s*%\}([\s\S]*?)\{%\s*else\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g, '$1')
        
        // Handle {% if debug %} ... {% else %} ... {% endif %} blocks - keep the debug content
        .replace(/\{%\s*if\s+debug\s*%\}([\s\S]*?)\{%\s*else\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g, '$1')
        
        // Replace {{ STATIC_URL }} with the correct path for development
        .replace(/\{\{\s*STATIC_URL\s*\}\}/g, '/')
        
        // Replace {{ csp_nonce }} with a generated nonce
        .replace(/\{\{\s*csp_nonce\s*\}\}/g, nonce)
        
        // Handle any other Django template variables
        .replace(/\{\{\s*[\w\.]+\s*\}\}/g, '');
    },
    
    // Process all files during load
    load(id) {
      // Skip node_modules
      if (id.includes('node_modules')) {
        return null;
      }
      
      // Read the file content
      try {
        const content = fs.readFileSync(id, 'utf-8');
        
        // Check if the file contains Django template variables
        if (content.includes('{{') || content.includes('{%')) {
          // Process Django template variables
          const processed = content
            .replace(/\{%\s*load\s+static\s*%\}/g, '')
            .replace(/\{%\s*if\s+is_debug\s*%\}([\s\S]*?)\{%\s*else\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g, '$1')
            .replace(/\{%\s*if\s+debug\s*%\}([\s\S]*?)\{%\s*else\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g, '$1')
            .replace(/\{\{\s*STATIC_URL\s*\}\}/g, '/')
            .replace(/\{\{\s*csp_nonce\s*\}\}/g, nonce)
            .replace(/\{\{\s*[\w\.]+\s*\}\}/g, '');
          
          return processed;
        }
      } catch (error) {
        // Silently fail if file can't be read
        return null;
      }
      
      return null;
    },
    
    // Transform all code
    transform(code, id) {
      // Skip node_modules
      if (id.includes('node_modules')) {
        return null;
      }
      
      // Process Django template variables in all files
      if (code.includes('{{') || code.includes('{%')) {
        const processed = code
          .replace(/\{%\s*load\s+static\s*%\}/g, '')
          .replace(/\{%\s*if\s+is_debug\s*%\}([\s\S]*?)\{%\s*else\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g, '$1')
          .replace(/\{%\s*if\s+debug\s*%\}([\s\S]*?)\{%\s*else\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g, '$1')
          .replace(/\{\{\s*STATIC_URL\s*\}\}/g, '/')
          .replace(/\{\{\s*csp_nonce\s*\}\}/g, nonce)
          .replace(/\{\{\s*[\w\.]+\s*\}\}/g, '');
        
        return {
          code: processed,
          map: null
        };
      }
      
      return null;
    }
  };
}

// Start Vite dev server
async function startServer() {
  try {
    // Create Vite server
    const server = await createServer({
      // Configure Vite
      root: __dirname,
      configFile: resolve(__dirname, 'vite.config.ts'),
      // Use our custom HTML file instead of Django template
      plugins: [],
      // Specify the custom HTML file
      customIndex: resolve(__dirname, 'index.custom.html'),
      server: {
        port: PORT,
        strictPort: true,
        fs: {
          // Allow serving files from one level up
          allow: [__dirname]
        },
        proxy: {
          // Proxy API requests to Django backend
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true
          },
          '/media': {
            target: 'http://localhost:8000',
            changeOrigin: true
          },
          '/admin': {
            target: 'http://localhost:8000',
            changeOrigin: true
          }
        }
      }
    });

    // Start the server
    await server.listen();
    
    console.log(`Development server running at http://localhost:${PORT}`);
    
    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server...');
      await server.close();
      process.exit(0);
    };
    
    // Handle process termination
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
    // Log when server is closed
    server.httpServer.on('close', () => {
      console.log('Server closed');
    });
  } catch (e) {
    console.error(`Error starting Vite server: ${e}`);
    process.exit(1);
  }
}

// Run the server
startServer();