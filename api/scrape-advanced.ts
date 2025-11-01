import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import specialized scraper (we'll need to inline it since we can't import from src in API routes)
const SPECIALIZED_CONFIGS = {
  'jobs.apple.com': {
    selectors: [
      '#jdp-job-description',
      '.job-description-content',
      '.jd-info',
      '.job-summary'
    ],
    removeSelectors: [
      '.apply-button',
      '.share-job',
      '.job-actions',
      'nav',
      'footer'
    ],
    company: 'Apple'
  },
  
  'careers.google.com': {
    selectors: [
      '[data-section="description"]',
      '.job-description',
      '.gc-job-detail__content'
    ],
    removeSelectors: [
      '.gc-job-detail__apply',
      '.gc-job-detail__share',
      'nav',
      'footer'
    ],
    company: 'Google'
  },
  
  'amazon.jobs': {
    selectors: [
      '.job-detail',
      '.job-description',
      '[data-test="job-description"]'
    ],
    removeSelectors: [
      '.apply-button-container',
      '.job-alert',
      'nav',
      'footer'
    ],
    company: 'Amazon'
  },
  
  'careers.microsoft.com': {
    selectors: [
      '.job-description-container',
      '.job-details',
      '[data-automation-id="jobPostingDescription"]'
    ],
    removeSelectors: [
      '.apply-section',
      '.job-share',
      'nav',
      'footer'
    ],
    company: 'Microsoft'
  },
  
  'jobs.netflix.com': {
    selectors: [
      '.job-description',
      '.job-posting-content',
      '.position-content'
    ],
    removeSelectors: [
      '.apply-now',
      '.share-job',
      'nav',
      'footer'
    ],
    company: 'Netflix'
  },
  
  'careers.meta.com': {
    selectors: [
      '[data-testid="job-description"]',
      '.job-description',
      '.position-details'
    ],
    removeSelectors: [
      '.apply-button',
      '.job-share',
      'nav',
      'footer'
    ],
    company: 'Meta'
  },
  
  'jobs.lever.co': {
    selectors: [
      '.section-wrapper',
      '.job-description',
      '.content'
    ],
    removeSelectors: [
      '.apply-button',
      '.postings-share',
      'nav',
      'footer'
    ],
    company: 'Various (Lever)'
  },
  
  'boards.greenhouse.io': {
    selectors: [
      '.job-post-content',
      '.application-details',
      '.job-description'
    ],
    removeSelectors: [
      '.application-form',
      '.job-post-apply',
      'nav',
      'footer'
    ],
    company: 'Various (Greenhouse)'
  },
  
  'linkedin.com/jobs': {
    selectors: [
      '.jobs-description-content__text',
      '.jobs-box__html-content',
      '.job-details'
    ],
    removeSelectors: [
      '.jobs-apply-button',
      '.jobs-save-button',
      '.jobs-share',
      'nav',
      'footer'
    ],
    company: 'Various (LinkedIn)'
  },
  
  'indeed.com': {
    selectors: [
      '.jobsearch-jobDescriptionText',
      '.jobsearch-JobComponent-description',
      '#jobDescriptionText'
    ],
    removeSelectors: [
      '.jobsearch-IndeedApplyButton',
      '.jobsearch-JobMetadataFooter',
      'nav',
      'footer'
    ],
    company: 'Various (Indeed)'
  },
  
  'glassdoor.com': {
    selectors: [
      '.jobDescriptionContent',
      '.desc',
      '.job-description-content'
    ],
    removeSelectors: [
      '.apply-btn',
      '.job-actions',
      'nav',
      'footer'
    ],
    company: 'Various (Glassdoor)'
  },
  
  'wellfound.com': {
    selectors: [
      '.job-description',
      '.startup-job-listing',
      '.job-content'
    ],
    removeSelectors: [
      '.apply-button',
      '.job-share',
      'nav',
      'footer'
    ],
    company: 'Various (Wellfound)'
  }
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Different user agents to rotate through
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
];

// Site-specific selectors for better content extraction
const siteSelectors: Record<string, string[]> = {
  'linkedin.com': [
    '.jobs-description-content__text',
    '.jobs-box__html-content',
    '.job-details',
    '.jobs-description'
  ],
  'indeed.com': [
    '.jobsearch-jobDescriptionText',
    '.jobsearch-JobComponent-description',
    '#jobDescriptionText',
    '.job-description'
  ],
  'glassdoor.com': [
    '.jobDescriptionContent',
    '.desc',
    '.job-description-content',
    '.jobDesc'
  ],
  'lever.co': [
    '.section-wrapper',
    '.job-description',
    '.content'
  ],
  'greenhouse.io': [
    '.job-post-content',
    '.application-details',
    '.job-description'
  ],
  'workday.com': [
    '[data-automation-id="jobPostingDescription"]',
    '.jobPostingDescription',
    '.job-description'
  ],
  'bamboohr.com': [
    '.job-description',
    '.BambooHR-ATS-Description'
  ]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, strategy = 'auto' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL provided' });
    }

    console.log(`Advanced scraping job from: ${url} with strategy: ${strategy}`);

    let content: string | null = null;
    let method = 'unknown';

    // Check if we have specialized scraping for this site
    const hasSpecializedScraper = Object.keys(SPECIALIZED_CONFIGS).some(domain => 
      parsedUrl.hostname.includes(domain) || domain.includes(parsedUrl.hostname.replace('www.', ''))
    );

    // Try different scraping strategies
    switch (strategy) {
      case 'basic':
        content = await basicScrape(url);
        method = 'basic';
        break;
      case 'targeted':
        content = await targetedScrape(url, parsedUrl.hostname);
        method = hasSpecializedScraper ? 'specialized-targeted' : 'targeted';
        break;
      case 'auto':
      default:
        // Try targeted first (includes specialized), then fall back to basic
        content = await targetedScrape(url, parsedUrl.hostname);
        method = hasSpecializedScraper ? 'specialized-targeted' : 'targeted';
        
        if (!content || content.length < 200) {
          content = await basicScrape(url);
          method = 'basic-fallback';
        }
        break;
    }

    if (!content || content.length < 100) {
      return res.status(400).json({ 
        error: 'Could not extract meaningful content from webpage',
        method: method
      });
    }

    // Enhance content extraction
    const enhancedContent = enhanceJobContent(content, parsedUrl.hostname);
    
    // Limit content size
    const limitedContent = enhancedContent.slice(0, 20000);

    console.log(`Successfully extracted ${limitedContent.length} characters using ${method}`);

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(200).json({
      success: true,
      content: limitedContent,
      url: url,
      contentLength: limitedContent.length,
      method: method,
      hostname: parsedUrl.hostname,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in advanced scraping:', error);
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }

    return res.status(500).json({ 
      error: 'Failed to scrape webpage',
      details: error.message 
    });
  }
}

async function basicScrape(url: string): Promise<string | null> {
  try {
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
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
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return extractTextFromHtml(html);
    
  } catch (error) {
    console.error('Basic scrape failed:', error);
    return null;
  }
}

async function targetedScrape(url: string, hostname: string): Promise<string | null> {
  try {
    const html = await basicScrape(url);
    if (!html) return null;

    // Try specialized scraping first
    const specializedResult = extractSpecializedContent(html, url);
    if (specializedResult && specializedResult.content.length > 200) {
      console.log(`Using specialized scraper for ${hostname}: ${specializedResult.method}`);
      return specializedResult.content;
    }

    // Find site-specific selectors (fallback)
    const selectors = Object.keys(siteSelectors).find(domain => hostname.includes(domain));
    
    if (selectors) {
      console.log(`Using targeted selectors for ${hostname}`);
      const targetedContent = extractTargetedContent(html, siteSelectors[selectors]);
      if (targetedContent && targetedContent.length > 200) {
        return targetedContent;
      }
    }

    // Fall back to basic extraction
    return extractTextFromHtml(html);
    
  } catch (error) {
    console.error('Targeted scrape failed:', error);
    return null;
  }
}

function extractSpecializedContent(html: string, url: string): {content: string, method: string} | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    
    // Find matching config
    let config = null;
    let domain = '';
    
    for (const [configDomain, configData] of Object.entries(SPECIALIZED_CONFIGS)) {
      if (hostname.includes(configDomain) || configDomain.includes(hostname.replace('www.', ''))) {
        config = configData;
        domain = configDomain;
        break;
      }
    }
    
    if (!config) return null;

    // Parse HTML (basic implementation without jsdom)
    let jobContent = '';
    
    // Try to extract content using specialized selectors
    for (const selector of config.selectors) {
      // Simple regex-based extraction for common patterns
      const classMatch = selector.match(/\.([a-zA-Z0-9_-]+)/);
      const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);
      const dataMatch = selector.match(/\[data-[^=]+=["']([^"']+)["']\]/);
      
      if (classMatch) {
        const className = classMatch[1];
        const regex = new RegExp(`<[^>]*class[^>]*${className}[^>]*>(.*?)<\/[^>]*>`, 'gis');
        const match = regex.exec(html);
        if (match && match[1]) {
          const content = extractTextFromHtml(match[1]);
          if (content.length > 200) {
            jobContent = content;
            break;
          }
        }
      }
      
      if (idMatch) {
        const idName = idMatch[1];
        const regex = new RegExp(`<[^>]*id[^>]*${idName}[^>]*>(.*?)<\/[^>]*>`, 'gis');
        const match = regex.exec(html);
        if (match && match[1]) {
          const content = extractTextFromHtml(match[1]);
          if (content.length > 200) {
            jobContent = content;
            break;
          }
        }
      }
    }

    if (!jobContent || jobContent.length < 100) {
      return null;
    }

    // Clean and enhance content
    const cleanContent = cleanJobContent(jobContent, config.company);
    
    return {
      content: cleanContent,
      method: `specialized-${domain}`
    };

  } catch (error) {
    console.error('Error in specialized extraction:', error);
    return null;
  }
}

function cleanJobContent(content: string, company: string): string {
  // Remove excessive whitespace
  let cleaned = content.replace(/\s+/g, ' ').trim();
  
  // Add company context if not already present
  if (!cleaned.toLowerCase().includes(company.toLowerCase())) {
    cleaned = `Company: ${company}\n\n${cleaned}`;
  }

  // Remove common noise
  const noisePatterns = [
    /apply now/gi,
    /share this job/gi,
    /save job/gi,
    /back to search/gi,
    /view all jobs/gi,
    /cookie policy/gi,
    /privacy policy/gi,
    /terms of service/gi,
    /©.*rights reserved/gi
  ];

  noisePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Normalize section headers
  cleaned = cleaned
    .replace(/\b(job description|description|overview)\b/gi, '\n\nJob Description:')
    .replace(/\b(responsibilities|duties|what you.ll do)\b/gi, '\n\nResponsibilities:')
    .replace(/\b(requirements|qualifications|what we.re looking for)\b/gi, '\n\nRequirements:')
    .replace(/\b(benefits|perks|what we offer)\b/gi, '\n\nBenefits:')
    .replace(/\b(about (us|the company)|company overview)\b/gi, '\n\nAbout the Company:');

  // Final cleanup
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

  return cleaned;
}

function extractTargetedContent(html: string, selectors: string[]): string | null {
  try {
    // Simple regex-based extraction for common patterns
    // In production, you'd want to use a proper DOM parser
    
    for (const selector of selectors) {
      // Convert CSS selector to a rough regex pattern
      let pattern = selector
        .replace(/\./g, '\\.')
        .replace(/#/g, '\\#')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]');
      
      // Look for content within elements matching the selector
      const classMatch = selector.match(/\.([a-zA-Z0-9_-]+)/);
      const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);
      
      if (classMatch) {
        const className = classMatch[1];
        const regex = new RegExp(`<[^>]*class[^>]*${className}[^>]*>(.*?)<\/[^>]*>`, 'gis');
        const match = regex.exec(html);
        if (match && match[1]) {
          const content = extractTextFromHtml(match[1]);
          if (content.length > 200) {
            return content;
          }
        }
      }
      
      if (idMatch) {
        const idName = idMatch[1];
        const regex = new RegExp(`<[^>]*id[^>]*${idName}[^>]*>(.*?)<\/[^>]*>`, 'gis');
        const match = regex.exec(html);
        if (match && match[1]) {
          const content = extractTextFromHtml(match[1]);
          if (content.length > 200) {
            return content;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in targeted extraction:', error);
    return null;
  }
}

function extractTextFromHtml(html: string): string {
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
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));
    
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

function enhanceJobContent(content: string, hostname: string): string {
  try {
    // Add context about the source
    let enhanced = `Source: ${hostname}\n\n${content}`;
    
    // Clean up common artifacts
    enhanced = enhanced
      .replace(/\bApply now\b/gi, '')
      .replace(/\bShare this job\b/gi, '')
      .replace(/\bSave job\b/gi, '')
      .replace(/\bBack to search\b/gi, '')
      .replace(/\bView all jobs\b/gi, '')
      .replace(/\bCookie policy\b/gi, '')
      .replace(/\bPrivacy policy\b/gi, '');
    
    // Normalize section headers
    enhanced = enhanced
      .replace(/\b(job description|description|overview)\b/gi, '\n\nJob Description:')
      .replace(/\b(responsibilities|duties|what you.ll do)\b/gi, '\n\nResponsibilities:')
      .replace(/\b(requirements|qualifications|what we.re looking for)\b/gi, '\n\nRequirements:')
      .replace(/\b(benefits|perks|what we offer)\b/gi, '\n\nBenefits:')
      .replace(/\b(about (us|the company)|company overview)\b/gi, '\n\nAbout the Company:');
    
    return enhanced;
  } catch (error) {
    console.error('Error enhancing content:', error);
    return content;
  }
}