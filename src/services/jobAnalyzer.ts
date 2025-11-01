import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface JobAnalysisResult {
  company: string;
  position: string;
  location: string;
  salary: string;
  experienceRequired: string;
  techStack: string[];
  jobType: string; // Full-time, Part-time, Contract, etc.
  workMode: string; // Remote, Hybrid, On-site
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  applicationDeadline?: string;
  confidence: number; // 0-1 score of how confident the AI is
  rawDescription?: string;
}

export class JobAnalyzer {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeJobFromUrl(url: string): Promise<JobAnalysisResult | null> {
    try {
      // Try advanced scraping first
      let content = await this.fetchWebpageContentAdvanced(url);

      // Fallback to basic scraping if advanced fails
      if (!content) {
        console.log('Advanced scraping failed, trying basic scraping...');
        content = await this.fetchWebpageContent(url);
      }

      if (!content) {
        throw new Error('Could not fetch webpage content with any method');
      }

      // Analyze the content with Gemini
      return await this.analyzeJobContent(content);
    } catch (error) {
      console.error('Error analyzing job from URL:', error);
      return null;
    }
  }

  async analyzeJobContent(content: string): Promise<JobAnalysisResult | null> {
    try {
      const prompt = `
You are a job posting analyzer. Extract information from the job posting and return ONLY a valid JSON object.

Job posting content:
${content}

CRITICAL: Return ONLY the JSON object below with no markdown formatting, no code blocks, no additional text:

{
  "company": "Company name",
  "position": "Job title/position",
  "location": "Location (city, state/country or 'Remote')",
  "salary": "Salary range or compensation details",
  "experienceRequired": "Years of experience required (e.g., '2-4 years', 'Entry level', 'Senior level')",
  "techStack": ["Technology 1", "Technology 2", "Technology 3"],
  "jobType": "Full-time/Part-time/Contract/Internship",
  "workMode": "Remote/Hybrid/On-site",
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
  "responsibilities": ["Responsibility 1", "Responsibility 2", "Responsibility 3"],
  "applicationDeadline": "Deadline if mentioned (YYYY-MM-DD format)",
  "confidence": 0.95,
  "rawDescription": "Brief summary of the role"
}

Rules:
- NO markdown code blocks (\`\`\`json)
- NO additional text or explanations
- Use empty string "" for missing text fields
- Use empty array [] for missing array fields
- Confidence score: 0.1 to 1.0 based on information clarity
- Tech stack: programming languages, frameworks, tools
- Keep arrays to 5-7 items maximum
- For salary: include "competitive", "DOE", etc. if no specific range
- Location: prefer specific cities over regions
`;

      const aiResult = await this.model.generateContent(prompt);
      const response = await aiResult.response;
      let text = response.text().trim();

      // Clean up the response - remove markdown code blocks if present
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Remove any leading/trailing whitespace and newlines
      text = text.trim();

      console.log('Cleaned AI response:', text.substring(0, 200) + '...');

      // Parse the JSON response
      let analysisResult;
      try {
        analysisResult = JSON.parse(text);
      } catch (parseError: any) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw AI response:', text);
        throw new Error(`Failed to parse AI response as JSON: ${parseError.message || 'Unknown parse error'}`);
      }

      // Validate the result has required fields
      if (!analysisResult.company && !analysisResult.position) {
        console.warn('AI analysis missing required fields:', analysisResult);
        // Still return the result, but with lower confidence
        analysisResult.confidence = Math.min(analysisResult.confidence || 0.5, 0.3);
      }

      // Ensure all required fields exist with defaults
      const finalResult: JobAnalysisResult = {
        company: analysisResult.company || 'Unknown Company',
        position: analysisResult.position || 'Unknown Position',
        location: analysisResult.location || '',
        salary: analysisResult.salary || '',
        experienceRequired: analysisResult.experienceRequired || '',
        techStack: Array.isArray(analysisResult.techStack) ? analysisResult.techStack : [],
        jobType: analysisResult.jobType || '',
        workMode: analysisResult.workMode || '',
        benefits: Array.isArray(analysisResult.benefits) ? analysisResult.benefits : [],
        requirements: Array.isArray(analysisResult.requirements) ? analysisResult.requirements : [],
        responsibilities: Array.isArray(analysisResult.responsibilities) ? analysisResult.responsibilities : [],
        applicationDeadline: analysisResult.applicationDeadline || '',
        confidence: Math.max(0.1, Math.min(1.0, analysisResult.confidence || 0.5)),
        rawDescription: analysisResult.rawDescription || ''
      };

      console.log('Successfully parsed AI analysis:', {
        company: finalResult.company,
        position: finalResult.position,
        confidence: finalResult.confidence,
        techStackCount: finalResult.techStack.length,
        benefitsCount: finalResult.benefits.length
      });

      return finalResult;
    } catch (error) {
      console.error('Error analyzing job content:', error);
      return null;
    }
  }

  private async fetchWebpageContentAdvanced(url: string): Promise<string | null> {
    try {
      // Check if we're in development mode
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

      let apiUrl = '/api/scrape-advanced';

      if (isDevelopment) {
        // Try development proxy server first
        try {
          const proxyResponse = await fetch('http://localhost:3001/health');
          if (proxyResponse.ok) {
            console.log('Development proxy server detected - using local proxy');
            apiUrl = 'http://localhost:3001/api/scrape-advanced';
          } else {
            throw new Error('Proxy not available');
          }
        } catch {
          console.log('Development proxy not available - use "npm run dev:proxy" to enable URL analysis in development');
          return null; // Will trigger fallback to text analysis
        }
      }

      // Use our advanced serverless API endpoint

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          strategy: 'auto' // Use auto strategy for best results
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.content) {
        throw new Error('Failed to extract content from webpage');
      }

      console.log(`Successfully fetched ${data.contentLength} characters using ${data.method} from ${data.hostname}`);
      return data.content;

    } catch (error) {
      console.error('Error fetching webpage via advanced API:', error);
      return null;
    }
  }

  private async fetchWebpageContent(url: string): Promise<string | null> {
    try {
      // Check if we're in development mode
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

      let apiUrl = '/api/scrape-job';

      if (isDevelopment) {
        // Try development proxy server first
        try {
          const proxyResponse = await fetch('http://localhost:3001/health');
          if (proxyResponse.ok) {
            console.log('Development proxy server detected - using local proxy');
            apiUrl = 'http://localhost:3001/api/scrape-job';
          } else {
            throw new Error('Proxy not available');
          }
        } catch {
          console.log('Development proxy not available');
          return null; // Will trigger fallback to text analysis
        }
      }

      // Use our basic serverless API endpoint as fallback

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.content) {
        throw new Error('Failed to extract content from webpage');
      }

      console.log(`Successfully fetched ${data.contentLength} characters from ${url} (basic method)`);
      return data.content;

    } catch (error) {
      console.error('Error fetching webpage via basic API:', error);
      return null;
    }
  }



  // Alternative method for when direct URL fetching fails
  async analyzeJobFromText(jobText: string): Promise<JobAnalysisResult | null> {
    return await this.analyzeJobContent(jobText);
  }

  // Helper method to format analysis result for display
  formatAnalysisForDisplay(analysis: JobAnalysisResult): string {
    return `
🏢 Company: ${analysis.company}
💼 Position: ${analysis.position}
📍 Location: ${analysis.location}
💰 Salary: ${analysis.salary || 'Not specified'}
⏱️ Experience: ${analysis.experienceRequired || 'Not specified'}
🛠️ Tech Stack: ${analysis.techStack.join(', ') || 'Not specified'}
📋 Job Type: ${analysis.jobType}
🏠 Work Mode: ${analysis.workMode}
✅ Confidence: ${Math.round(analysis.confidence * 100)}%
    `.trim();
  }
}

// Export a singleton instance
export const jobAnalyzer = new JobAnalyzer();