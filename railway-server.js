#!/usr/bin/env node

// Railway Production Server
// Ensures proper binding to 0.0.0.0 for health checks

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '8080', 10);
const hostname = '0.0.0.0'; // MUST be 0.0.0.0 for Railway

console.log('🚂 Railway Production Server');
console.log(`📍 Binding to: ${hostname}:${port}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);

// Override environment variables
process.env.HOSTNAME = hostname;
process.env.PORT = port.toString();

console.log('🚀 Starting Next.js production server...');

// Create Next.js app
const app = next({ 
  dev: false, 
  hostname,
  port,
  dir: __dirname
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`✅ Server ready on http://${hostname}:${port}`);
    console.log('📦 Next.js will handle all static assets automatically');
  });
}).catch((ex) => {
  console.error('❌ Failed to start server:', ex.stack);
  process.exit(1);
});
