import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS headers for the API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL provided' });
    }

    console.log(`Scraping job from: ${url}`);

    // Fetch the webpage with proper headers to avoid blocking
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return res.status(response.status).json({ 
        error: `Failed to fetch webpage: ${response.status} ${response.statusText}` 
      });
    }

    const html = await response.text();
    
    if (!html || html.length < 100) {
      return res.status(400).json({ error: 'Webpage content appears to be empty or too short' });
    }

    // Extract text content from HTML
    const textContent = extractTextFromHtml(html);
    
    if (!textContent || textContent.length < 100) {
      return res.status(400).json({ error: 'Could not extract meaningful content from webpage' });
    }

    // Limit content size to avoid token limits (keep first 15000 characters)
    const limitedContent = textContent.slice(0, 15000);

    console.log(`Successfully extracted ${limitedContent.length} characters from ${url}`);

    // Set CORS headers and return the content
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(200).json({
      success: true,
      content: limitedContent,
      url: url,
      contentLength: limitedContent.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error scraping job:', error);
    
    // Set CORS headers even for errors
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Handle specific error types
    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout - webpage took too long to load' });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(400).json({ error: 'Could not connect to the website. Please check the URL.' });
    }

    return res.status(500).json({ 
      error: 'Failed to scrape webpage',
      details: error.message 
    });
  }
}

function extractTextFromHtml(html: string): string {
  try {
    // Remove script and style tags and their content
    let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove HTML comments
    cleanHtml = cleanHtml.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remove all HTML tags but keep the content
    cleanHtml = cleanHtml.replace(/<[^>]*>/g, ' ');
    
    // Decode HTML entities
    cleanHtml = cleanHtml
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
    
    // Clean up whitespace
    cleanHtml = cleanHtml
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
    
    return cleanHtml;
  } catch (error) {
    console.error('Error extracting text from HTML:', error);
    return '';
  }
}

// Helper function to detect if content looks like a job posting
function isJobPostingContent(content: string): boolean {
  const jobKeywords = [
    'job', 'position', 'role', 'career', 'employment', 'hiring',
    'responsibilities', 'requirements', 'qualifications', 'experience',
    'salary', 'benefits', 'apply', 'candidate', 'skills'
  ];
  
  const lowerContent = content.toLowerCase();
  const keywordCount = jobKeywords.filter(keyword => lowerContent.includes(keyword)).length;
  
  return keywordCount >= 3; // At least 3 job-related keywords
}