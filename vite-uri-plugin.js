// Custom Vite plugin to handle URI encoding issues

/**
 * A Vite plugin that intercepts and handles URI encoding issues
 * by safely processing URLs before they're passed to decodeURI or decodeURIComponent
 */
export default function uriSafePlugin() {
  return {
    name: 'vite-plugin-uri-safe',
    // Apply this plugin early in the plugin pipeline
    enforce: 'pre',
    configureServer(server) {
      // Store original functions that we need to patch
      const originalDecodeURI = global.decodeURI;
      const originalDecodeURIComponent = global.decodeURIComponent;
      
      // Create a safe version of decodeURI that won't throw on malformed input
      global.decodeURI = function safeDecodeURI(uri) {
        try {
          return originalDecodeURI(uri);
        } catch (e) {
          console.warn(`[URI Safe Plugin] Prevented URI malformed error in decodeURI for: ${uri}`);
          // Return the original string if decoding fails
          return uri;
        }
      };
      
      // Create a safe version of decodeURIComponent that won't throw on malformed input
      global.decodeURIComponent = function safeDecodeURIComponent(uri) {
        try {
          return originalDecodeURIComponent(uri);
        } catch (e) {
          console.warn(`[URI Safe Plugin] Prevented URI malformed error in decodeURIComponent for: ${uri}`);
          // Return the original string if decoding fails
          return uri;
        }
      };
      
      // Store the original functions for later restoration
      global.originalDecodeURI = originalDecodeURI;
      global.originalDecodeURIComponent = originalDecodeURIComponent;
      
      // Add a middleware that runs before any other middleware
      return () => {
        server.middlewares.use((req, res, next) => {
          try {
            if (!req.url) {
              return next();
            }
            
            // Store the original URL
            const originalUrl = req.url;
            
            // Comprehensive URL sanitization
            // 1. Handle incomplete percent-encoded sequences
            let safeUrl = originalUrl.replace(/%(?![0-9A-Fa-f]{2})/g, '%25');
            
            // 2. Handle invalid percent-encoded sequences
            const percentRegex = /%[0-9A-Fa-f]{2}/g;
            let match;
            while ((match = percentRegex.exec(safeUrl)) !== null) {
              try {
                originalDecodeURIComponent(match[0]); // Use original to avoid our patched version
              } catch (e) {
                // Replace the invalid sequence with its encoded form
                const before = safeUrl.substring(0, match.index);
                const after = safeUrl.substring(match.index + match[0].length);
                safeUrl = before + encodeURIComponent(match[0]) + after;
                // Reset regex to continue from the new position
                percentRegex.lastIndex = match.index + encodeURIComponent(match[0]).length;
              }
            }
            
            // 3. Encode non-ASCII characters
            safeUrl = safeUrl.replace(/[\u0080-\uFFFF]/g, c => encodeURIComponent(c));
            
            // 4. Handle special characters that might cause issues
            safeUrl = safeUrl.replace(/[\[\]\{\}\|\\^`<>]/g, c => encodeURIComponent(c));
            
            // 5. Handle curly braces and percent signs that might be template literals
            safeUrl = safeUrl.replace(/\{%.*?%\}/g, match => encodeURIComponent(match));
            
            // Only update and log if we made changes
            if (safeUrl !== originalUrl) {
              req.url = safeUrl;
              console.log(`[URI Safe Plugin] Sanitized URL: ${originalUrl} → ${req.url}`);
            }
            
            next();
          } catch (error) {
            console.error('[URI Safe Plugin] Error processing URL:', error);
            // Continue despite errors
            next();
          }
        });
      };
    },
    // Restore original functions when server closes
    closeBundle() {
      if (global.originalDecodeURI) {
        global.decodeURI = global.originalDecodeURI;
        delete global.originalDecodeURI;
      }
      if (global.originalDecodeURIComponent) {
        global.decodeURIComponent = global.originalDecodeURIComponent;
        delete global.originalDecodeURIComponent;
      }
    }
  };
}