#!/usr/bin/env node

/**
 * Development proxy server for testing web scraping locally
 * This is optional - the app works fine without it using text analysis
 */

import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// User agents for rotation
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

// Basic scraping endpoint
app.post('/api/scrape-job', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`[DEV PROXY] Scraping: ${url}`);

    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const textContent = extractTextFromHtml(html);
    const limitedContent = textContent.slice(0, 15000);

    console.log(`[DEV PROXY] Successfully extracted ${limitedContent.length} characters`);

    res.json({
      success: true,
      content: limitedContent,
      url: url,
      contentLength: limitedContent.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[DEV PROXY] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to scrape webpage',
      details: error.message 
    });
  }
});

// Advanced scraping endpoint (simplified for dev)
app.post('/api/scrape-advanced', async (req, res) => {
  // For development, just use the basic scraping
  req.url = '/api/scrape-job';
  return app._router.handle(req, res);
});

function extractTextFromHtml(html) {
  try {
    // Remove script and style tags
    let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    cleanHtml = cleanHtml.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remove HTML tags
    cleanHtml = cleanHtml.replace(/<[^>]*>/g, ' ');
    
    // Decode HTML entities
    cleanHtml = cleanHtml
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Clean up whitespace
    cleanHtml = cleanHtml
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    return cleanHtml;
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Development proxy server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Development Proxy Server Started!

Server: http://localhost:${PORT}
Health: http://localhost:${PORT}/health

This proxy allows testing web scraping in development.
Your app will automatically use this when available.

To stop: Press Ctrl+C
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development proxy server...');
  process.exit(0);
});

export default app