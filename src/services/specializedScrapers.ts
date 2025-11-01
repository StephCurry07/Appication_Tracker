/**
 * Specialized scrapers for major job sites
 * These extract only the relevant job posting content instead of the entire page
 */

export interface ScrapingResult {
  content: string;
  method: string;
  confidence: number;
}

// Site-specific content selectors and extraction rules
const SITE_CONFIGS = {
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

export class SpecializedScraper {

  /**
   * Check if we have a specialized scraper for this URL
   */
  static canHandle(url: string): boolean {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return Object.keys(SITE_CONFIGS).some(domain =>
        hostname.includes(domain) || domain.includes(hostname.replace('www.', ''))
      );
    } catch {
      return false;
    }
  }

  /**
   * Get the site configuration for a URL
   */
  static getSiteConfig(url: string) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();

      for (const [domain, config] of Object.entries(SITE_CONFIGS)) {
        if (hostname.includes(domain) || domain.includes(hostname.replace('www.', ''))) {
          return { domain, ...config };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Extract job content using specialized selectors
   */
  static extractSpecializedContent(html: string, url: string): ScrapingResult | null {
    const config = this.getSiteConfig(url);
    if (!config) return null;

    try {
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Remove unwanted elements first
      config.removeSelectors?.forEach(selector => {
        const elements = doc.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });

      // Try to find content using specialized selectors
      let jobContent = '';

      for (const selector of config.selectors) {
        const element = doc.querySelector(selector);
        if (element) {
          jobContent = element.textContent || (element as any).innerText || '';
          if (jobContent.length > 200) { // Found substantial content
            break;
          }
        }
      }

      // If no specific content found, try common job posting patterns
      if (!jobContent || jobContent.length < 200) {
        const fallbackSelectors = [
          '[class*="job-description"]',
          '[class*="job-detail"]',
          '[class*="job-content"]',
          '[class*="position-description"]',
          '[id*="job-description"]',
          '[data-testid*="job"]',
          'main',
          '.content'
        ];

        for (const selector of fallbackSelectors) {
          const element = doc.querySelector(selector);
          if (element) {
            jobContent = element.textContent || (element as any).innerText || '';
            if (jobContent.length > 200) {
              break;
            }
          }
        }
      }

      if (!jobContent || jobContent.length < 100) {
        return null;
      }

      // Clean up the content
      const cleanContent = this.cleanJobContent(jobContent, config.company);

      return {
        content: cleanContent,
        method: `specialized-${config.domain}`,
        confidence: jobContent.length > 1000 ? 0.9 : 0.7
      };

    } catch (error) {
      console.error('Error in specialized extraction:', error);
      return null;
    }
  }

  /**
   * Clean and enhance job content
   */
  private static cleanJobContent(content: string, company: string): string {
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

  /**
   * Get list of supported sites for documentation
   */
  static getSupportedSites(): Array<{ domain: string, company: string }> {
    return Object.entries(SITE_CONFIGS).map(([domain, config]) => ({
      domain,
      company: config.company
    }));
  }
}

// Export supported sites for reference
export const SUPPORTED_SITES = SpecializedScraper.getSupportedSites();