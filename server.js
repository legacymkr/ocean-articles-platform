#!/usr/bin/env node

// Custom server wrapper to ensure PORT environment variable is used
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '8080', 10);

// Use standalone server in production
if (!dev) {
  console.log('🚀 Starting Next.js standalone server...');
  console.log(`📍 Hostname: ${hostname}`);
  console.log(`🔌 Port: ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  
  // Import and start the standalone server
  const standaloneServer = require('./.next/standalone/server.js');
  
  // The standalone server will use PORT from environment
  process.env.PORT = port.toString();
  process.env.HOSTNAME = hostname;
} else {
  // Development mode
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    })
      .once('error', (err) => {
        console.error(err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  });
}
