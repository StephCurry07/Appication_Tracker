import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus, StatusLabels } from '../types';
import { getCurrentDate } from '../utils/storage';
import { jobAnalyzer, JobAnalysisResult } from '../services/jobAnalyzer';

interface ApplicationFormProps {
  onSubmit: (application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: JobApplication;
}

interface FormData {
  company: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string;
  location: string;
  salary: string;
  notes: string;
  contactPerson: string;
  contactEmail: string;
  jobUrl: string;
  experienceRequired: string;
  techStack: string[];
  jobType: string;
  workMode: string;
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  applicationDeadline: string;
  aiAnalysisConfidence: number;
  aiAnalyzedAt: string;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  // Load form data from localStorage if available (for draft persistence)
  const [formData, setFormData] = useState<FormData>(() => {
    if (initialData) {
      return {
        company: initialData.company,
        position: initialData.position,
        status: initialData.status,
        dateApplied: initialData.dateApplied,
        location: initialData.location || '',
        salary: initialData.salary || '',
        notes: initialData.notes || '',
        contactPerson: initialData.contactPerson || '',
        contactEmail: initialData.contactEmail || '',
        jobUrl: initialData.jobUrl || '',
        // AI fields
        experienceRequired: initialData.experienceRequired || '',
        techStack: initialData.techStack || [],
        jobType: initialData.jobType || '',
        workMode: initialData.workMode || '',
        benefits: initialData.benefits || [],
        requirements: initialData.requirements || [],
        responsibilities: initialData.responsibilities || [],
        applicationDeadline: initialData.applicationDeadline || '',
        aiAnalysisConfidence: initialData.aiAnalysisConfidence || 0,
        aiAnalyzedAt: initialData.aiAnalyzedAt || ''
      };
    }

    // Try to load draft from sessionStorage (only persists within same tab)
    const savedDraft = sessionStorage.getItem('applicationFormDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        return {
          ...parsed,
          dateApplied: parsed.dateApplied || getCurrentDate()
        };
      } catch (error) {
        console.warn('Failed to parse saved draft:', error);
      }
    }

    // Default form data
    return {
      company: '',
      position: '',
      status: ApplicationStatus.DRAFT,
      dateApplied: getCurrentDate(),
      location: '',
      salary: '',
      notes: '',
      contactPerson: '',
      contactEmail: '',
      jobUrl: '',
      // AI fields
      experienceRequired: '',
      techStack: [],
      jobType: '',
      workMode: '',
      benefits: [],
      requirements: [],
      responsibilities: [],
      applicationDeadline: '',
      aiAnalysisConfidence: 0,
      aiAnalyzedAt: ''
    };
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JobAnalysisResult | null>(null);
  const [showAiFields, setShowAiFields] = useState(() => {
    // Show AI fields if we have AI data or if it was previously shown in this session
    return !!(formData.aiAnalyzedAt || sessionStorage.getItem('showAiFields') === 'true');
  });
  const [dateAutoUpdated, setDateAutoUpdated] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company,
        position: initialData.position,
        status: initialData.status,
        dateApplied: initialData.dateApplied,
        location: initialData.location || '',
        salary: initialData.salary || '',
        notes: initialData.notes || '',
        contactPerson: initialData.contactPerson || '',
        contactEmail: initialData.contactEmail || '',
        jobUrl: initialData.jobUrl || '',
        // AI fields
        experienceRequired: initialData.experienceRequired || '',
        techStack: initialData.techStack || [],
        jobType: initialData.jobType || '',
        workMode: initialData.workMode || '',
        benefits: initialData.benefits || [],
        requirements: initialData.requirements || [],
        responsibilities: initialData.responsibilities || [],
        applicationDeadline: initialData.applicationDeadline || '',
        aiAnalysisConfidence: initialData.aiAnalysisConfidence || 0,
        aiAnalyzedAt: initialData.aiAnalyzedAt || ''
      });
      
      // Show AI fields if they have data
      if (initialData.aiAnalyzedAt) {
        setShowAiFields(true);
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    
    // Clear draft from sessionStorage after successful submission
    if (!initialData) {
      sessionStorage.removeItem('applicationFormDraft');
      sessionStorage.removeItem('showAiFields');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    
    // Auto-update dateApplied when status changes from draft to applied
    if (name === 'status' && value === 'applied' && formData.status === 'draft') {
      newFormData.dateApplied = getCurrentDate();
      setDateAutoUpdated(true);
      // Clear the indicator after 3 seconds
      setTimeout(() => setDateAutoUpdated(false), 3000);
    }
    
    setFormData(newFormData);
    
    // Save draft to sessionStorage (but not when editing existing application)
    if (!initialData) {
      sessionStorage.setItem('applicationFormDraft', JSON.stringify(newFormData));
    }
  };

  const handleAnalyzeJob = async () => {
    if (!formData.jobUrl) {
      alert('Please enter a job URL first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      console.log('Starting AI analysis of job URL...');
      const analysis = await jobAnalyzer.analyzeJobFromUrl(formData.jobUrl);
      
      if (analysis) {
        console.log('AI analysis completed successfully:', analysis);
        setAnalysisResult(analysis);
        
        // Auto-fill form with AI analysis
        setFormData(prev => ({
          ...prev,
          company: analysis.company || prev.company,
          position: analysis.position || prev.position,
          location: analysis.location || prev.location,
          salary: analysis.salary || prev.salary,
          experienceRequired: analysis.experienceRequired,
          techStack: analysis.techStack,
          jobType: analysis.jobType,
          workMode: analysis.workMode,
          benefits: analysis.benefits,
          requirements: analysis.requirements,
          responsibilities: analysis.responsibilities,
          applicationDeadline: analysis.applicationDeadline || '',
          aiAnalysisConfidence: analysis.confidence,
          aiAnalyzedAt: new Date().toISOString()
        }));
        
        setShowAiFields(true);
        sessionStorage.setItem('showAiFields', 'true');
        
        // Update notes with AI summary
        const aiSummary = `\n\n--- AI Analysis (${Math.round(analysis.confidence * 100)}% confidence) ---\n${jobAnalyzer.formatAnalysisForDisplay(analysis)}`;
        const updatedFormData = {
          ...formData,
          ...{
            company: analysis.company || formData.company,
            position: analysis.position || formData.position,
            location: analysis.location || formData.location,
            salary: analysis.salary || formData.salary,
            experienceRequired: analysis.experienceRequired,
            techStack: analysis.techStack,
            jobType: analysis.jobType,
            workMode: analysis.workMode,
            benefits: analysis.benefits,
            requirements: analysis.requirements,
            responsibilities: analysis.responsibilities,
            applicationDeadline: analysis.applicationDeadline || '',
            aiAnalysisConfidence: analysis.confidence,
            aiAnalyzedAt: new Date().toISOString(),
            notes: formData.notes + aiSummary
          }
        };
        setFormData(updatedFormData);
        
        // Save updated form data to sessionStorage
        if (!initialData) {
          sessionStorage.setItem('applicationFormDraft', JSON.stringify(updatedFormData));
        }
        
        // Show success message
        alert(`✅ AI analysis completed with ${Math.round(analysis.confidence * 100)}% confidence! Review the auto-filled information and make any necessary adjustments.`);
      } else {
        console.error('AI analysis returned null result');
        
        // Check if we're in development mode
        const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
        
        if (isDevelopment) {
          alert('🔧 Development Mode: URL analysis is only available in production.\n\nTo test AI analysis:\n1. Use the "📝 Analyze Text" button instead\n2. Copy the job description from the website\n3. Paste it when prompted\n\nOr deploy to Vercel to test URL analysis.');
        } else {
          alert('❌ Could not analyze the job posting. The website might be blocking automated access or the content might not be accessible. Try using the "Analyze Text" option instead by copying and pasting the job description.');
        }
      }
    } catch (error) {
      console.error('Error analyzing job:', error);
      alert('❌ Failed to analyze job posting. This could be due to:\n\n• Website blocking automated access\n• Network connectivity issues\n• Invalid or inaccessible URL\n\nTry using the "Analyze Text" option instead.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeText = async () => {
    const jobText = prompt('Paste the job description text here:');
    if (!jobText) return;

    setIsAnalyzing(true);
    try {
      const analysis = await jobAnalyzer.analyzeJobFromText(jobText);
      
      if (analysis) {
        setAnalysisResult(analysis);
        
        // Auto-fill form with AI analysis
        setFormData(prev => ({
          ...prev,
          company: analysis.company || prev.company,
          position: analysis.position || prev.position,
          location: analysis.location || prev.location,
          salary: analysis.salary || prev.salary,
          experienceRequired: analysis.experienceRequired,
          techStack: analysis.techStack,
          jobType: analysis.jobType,
          workMode: analysis.workMode,
          benefits: analysis.benefits,
          requirements: analysis.requirements,
          responsibilities: analysis.responsibilities,
          applicationDeadline: analysis.applicationDeadline || '',
          aiAnalysisConfidence: analysis.confidence,
          aiAnalyzedAt: new Date().toISOString()
        }));
        
        setShowAiFields(true);
        
        // Update notes with AI summary
        const aiSummary = `\n\n--- AI Analysis ---\n${jobAnalyzer.formatAnalysisForDisplay(analysis)}`;
        setFormData(prev => ({
          ...prev,
          notes: prev.notes + aiSummary
        }));
      }
    } catch (error) {
      console.error('Error analyzing job text:', error);
      alert('Failed to analyze job description. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleArrayFieldChange = (fieldName: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData((prev: any) => ({ ...prev, [fieldName]: items }));
  };

  return (
    <div className="form-container">
      <h2>{initialData ? 'Edit Application' : 'Add New Application'}</h2>
      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="company">Company *</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="position">Position *</label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {Object.entries(StatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dateApplied">
              Date Applied
              {dateAutoUpdated && (
                <span className="auto-update-indicator">📅 Auto-updated to today!</span>
              )}
            </label>
            <input
              type="date"
              id="dateApplied"
              name="dateApplied"
              value={formData.dateApplied}
              onChange={handleChange}
              className={dateAutoUpdated ? 'auto-updated' : ''}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA"
            />
          </div>
          <div className="form-group">
            <label htmlFor="salary">Salary Range</label>
            <input
              type="text"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., $80k - $120k"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contactPerson">Contact Person</label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Recruiter or hiring manager name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="contact@company.com"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="jobUrl">Job URL</label>
          <div className="url-input-group">
            <input
              type="url"
              id="jobUrl"
              name="jobUrl"
              value={formData.jobUrl}
              onChange={handleChange}
              placeholder="https://company.com/jobs/123"
            />
            <div className="ai-buttons">
              <button
                type="button"
                onClick={handleAnalyzeJob}
                disabled={isAnalyzing || !formData.jobUrl}
                className="btn-ai"
                title={
                  (import.meta.env.DEV || window.location.hostname === 'localhost')
                    ? "URL analysis only works in production - use 'Analyze Text' for development"
                    : "Analyze job posting with AI"
                }
              >
                {isAnalyzing ? '🤖 Analyzing...' : '🤖 AI Analyze'}
                {(import.meta.env.DEV || window.location.hostname === 'localhost') && (
                  <span className="dev-badge">PROD ONLY</span>
                )}
              </button>
              <button
                type="button"
                onClick={handleAnalyzeText}
                disabled={isAnalyzing}
                className="btn-ai-alt"
                title="Analyze job description from text"
              >
                📝 Analyze Text
                {(import.meta.env.DEV || window.location.hostname === 'localhost') && (
                  <span className="dev-badge">DEV OK</span>
                )}
              </button>
            </div>
          </div>
          {(import.meta.env.DEV || window.location.hostname === 'localhost') && (
            <div className="dev-notice">
              <h4>🔧 Development Mode</h4>
              <p>URL analysis requires server-side scraping. Choose an option:</p>
              <ul>
                <li><strong>Quick option:</strong> Use "📝 Analyze Text" button</li>
                <li><strong>Test URL analysis:</strong> Run <code>npm run dev:proxy</code> in another terminal</li>
                <li><strong>Full testing:</strong> Deploy to Vercel</li>
              </ul>
            </div>
          )}
          
          {analysisResult && (
            <div className="ai-analysis-result">
              <p>✅ AI Analysis Complete (Confidence: {Math.round(analysisResult.confidence * 100)}%)</p>
            </div>
          )}
        </div>

        {showAiFields && (
          <div className="ai-fields-section">
            <div className="section-header">
              <h3>🤖 AI-Extracted Information</h3>
              <button
                type="button"
                onClick={() => setShowAiFields(!showAiFields)}
                className="toggle-button"
              >
                {showAiFields ? 'Hide' : 'Show'} AI Fields
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="experienceRequired">Experience Required</label>
                <input
                  type="text"
                  id="experienceRequired"
                  name="experienceRequired"
                  value={formData.experienceRequired}
                  onChange={handleChange}
                  placeholder="e.g., 2-4 years, Entry level"
                />
              </div>
              <div className="form-group">
                <label htmlFor="jobType">Job Type</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                >
                  <option value="">Select job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="workMode">Work Mode</label>
                <select
                  id="workMode"
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                >
                  <option value="">Select work mode</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="applicationDeadline">Application Deadline</label>
                <input
                  type="date"
                  id="applicationDeadline"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="techStack">Tech Stack</label>
              <input
                type="text"
                id="techStack"
                value={formData.techStack.join(', ')}
                onChange={(e) => handleArrayFieldChange('techStack', e.target.value)}
                placeholder="React, Node.js, Python, AWS (comma-separated)"
              />
              <small className="form-hint">Separate technologies with commas</small>
            </div>

            <div className="form-group">
              <label htmlFor="benefits">Benefits</label>
              <input
                type="text"
                id="benefits"
                value={formData.benefits.join(', ')}
                onChange={(e) => handleArrayFieldChange('benefits', e.target.value)}
                placeholder="Health insurance, 401k, Remote work (comma-separated)"
              />
              <small className="form-hint">Separate benefits with commas</small>
            </div>

            <div className="form-group">
              <label htmlFor="requirements">Requirements</label>
              <textarea
                id="requirements"
                value={formData.requirements.join('\n')}
                onChange={(e) => handleArrayFieldChange('requirements', e.target.value.replace(/\n/g, ','))}
                rows={3}
                placeholder="Bachelor's degree in CS&#10;3+ years experience&#10;Strong communication skills"
              />
              <small className="form-hint">One requirement per line</small>
            </div>

            <div className="form-group">
              <label htmlFor="responsibilities">Responsibilities</label>
              <textarea
                id="responsibilities"
                value={formData.responsibilities.join('\n')}
                onChange={(e) => handleArrayFieldChange('responsibilities', e.target.value.replace(/\n/g, ','))}
                rows={3}
                placeholder="Develop web applications&#10;Collaborate with team&#10;Write clean code"
              />
              <small className="form-hint">One responsibility per line</small>
            </div>

            {formData.aiAnalysisConfidence > 0 && (
              <div className="ai-confidence">
                <span>AI Analysis Confidence: {Math.round(formData.aiAnalysisConfidence * 100)}%</span>
                <small>Analyzed on {new Date(formData.aiAnalyzedAt).toLocaleDateString()}</small>
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Additional notes about the application..."
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          {!initialData && (
            <button 
              type="button" 
              onClick={() => {
                if (window.confirm('Clear all form data? This cannot be undone.')) {
                  sessionStorage.removeItem('applicationFormDraft');
                  sessionStorage.removeItem('showAiFields');
                  window.location.reload();
                }
              }} 
              className="btn-danger-small"
            >
              Clear Draft
            </button>
          )}
          <button type="submit" className="btn-primary">
            {initialData ? 'Update' : 'Add'} Application
          </button>
        </div>
      </form>
    </div>
  );
};