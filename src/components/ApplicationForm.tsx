import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus, Interview, Document, FollowUp, InterviewType, DocumentType, FollowUpType } from '../types';
import { getCurrentDate, getCurrentDateTime } from '../utils/dateUtils';
import { generateId } from '../utils/storage';

interface ApplicationFormProps {
  application?: JobApplication | null;
  onSubmit: (application: JobApplication | Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ application, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    salaryRange: '',
    jobDescription: '',
    applicationDate: getCurrentDate(),
    status: ApplicationStatus.DRAFT,
    source: '',
    contactPerson: '',
    contactEmail: '',
    notes: '',
  });

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company,
        position: application.position,
        location: application.location,
        salaryRange: application.salaryRange || '',
        jobDescription: application.jobDescription || '',
        applicationDate: application.applicationDate,
        status: application.status,
        source: application.source,
        contactPerson: application.contactPerson || '',
        contactEmail: application.contactEmail || '',
        notes: application.notes,
      });
      setInterviews(application.interviews);
      setDocuments(application.documents);
      setFollowUps(application.followUps);
    }
  }, [application]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const applicationData = {
      ...formData,
      interviews,
      documents,
      followUps,
    };

    if (application) {
      onSubmit({
        ...application,
        ...applicationData,
      });
    } else {
      onSubmit(applicationData);
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div>
      <div className="modal-header">
        <h2 className="modal-title">
          {application ? 'Edit Application' : 'Add New Application'}
        </h2>
        <button className="close-btn" onClick={onCancel}>
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="company">Company *</label>
            <input
              type="text"
              id="company"
              name="company"
              className="form-control"
              value={formData.company}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="position">Position *</label>
            <input
              type="text"
              id="position"
              name="position"
              className="form-control"
              value={formData.position}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              className="form-control"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="salaryRange">Salary Range</label>
            <input
              type="text"
              id="salaryRange"
              name="salaryRange"
              className="form-control"
              placeholder="e.g., $80,000 - $100,000"
              value={formData.salaryRange}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="applicationDate">Application Date *</label>
            <input
              type="date"
              id="applicationDate"
              name="applicationDate"
              className="form-control"
              value={formData.applicationDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              {Object.values(ApplicationStatus).map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="source">Source *</label>
            <input
              type="text"
              id="source"
              name="source"
              className="form-control"
              placeholder="e.g., LinkedIn, Indeed, Company Website"
              value={formData.source}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactPerson">Contact Person</label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              className="form-control"
              value={formData.contactPerson}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Contact Email</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            className="form-control"
            value={formData.contactEmail}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobDescription">Job Description</label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            className="form-control textarea"
            rows={4}
            value={formData.jobDescription}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            className="form-control textarea"
            rows={4}
            placeholder="Any additional notes, feedback, or follow-up items..."
            value={formData.notes}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex gap-10 mt-20">
          <button type="submit" className="btn btn-primary">
            {application ? 'Update Application' : 'Add Application'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;