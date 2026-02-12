#!/usr/bin/env node

// Railway Production Start Script
// This ensures the server binds to 0.0.0.0 for health checks

const { createServer } = require('http');
const { parse } = require('url');
const next = require('./.next/standalone/server.js');

const port = parseInt(process.env.PORT || '8080', 10);
const hostname = '0.0.0.0'; // MUST be 0.0.0.0 for Railway health checks

console.log('🚂 Railway Production Server Starting...');
console.log(`📍 PORT: ${port}`);
console.log(`🌍 HOSTNAME: ${hostname}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'production'}`);

// Set environment variables
process.env.HOSTNAME = hostname;
process.env.PORT = port.toString();

console.log('🚀 Starting Next.js server...');

// Start the Next.js standalone server
const server = next.startServer({
  port,
  hostname,
}).then(() => {
  console.log(`✅ Server ready on http://${hostname}:${port}`);
  console.log('✅ Health check endpoint: /api/health');
}).catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
