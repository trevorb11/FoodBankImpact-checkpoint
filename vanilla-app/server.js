/**
 * Simple Express server for the vanilla HTML/CSS/JS Impact Wrapped application
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up static file serving
app.use(express.static(__dirname));

// For all routes not matched by static files, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Impact Wrapped vanilla app running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});