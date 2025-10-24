import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus, StatusLabels } from '../types';
import { getCurrentDate } from '../utils/storage';

interface ApplicationFormProps {
  onSubmit: (application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: JobApplication;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: ApplicationStatus.DRAFT,
    dateApplied: getCurrentDate(),
    location: '',
    salary: '',
    notes: '',
    contactPerson: '',
    contactEmail: '',
    jobUrl: ''
  });

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
        jobUrl: initialData.jobUrl || ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            <label htmlFor="dateApplied">Date Applied</label>
            <input
              type="date"
              id="dateApplied"
              name="dateApplied"
              value={formData.dateApplied}
              onChange={handleChange}
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
          <input
            type="url"
            id="jobUrl"
            name="jobUrl"
            value={formData.jobUrl}
            onChange={handleChange}
            placeholder="https://company.com/jobs/123"
          />
        </div>

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
          <button type="submit" className="btn-primary">
            {initialData ? 'Update' : 'Add'} Application
          </button>
        </div>
      </form>
    </div>
  );
};