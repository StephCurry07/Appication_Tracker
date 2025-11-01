import React, { useState } from 'react';
import { JobApplication, ApplicationStatus, StatusLabels } from '../types';

interface ApplicationListProps {
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dateApplied' | 'company' | 'status'>('dateApplied');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = 
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.location && app.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'dateApplied':
          aValue = new Date(a.dateApplied).getTime();
          bValue = new Date(b.dateApplied).getTime();
          break;
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.dateApplied;
          bValue = b.dateApplied;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status: ApplicationStatus): string => {
    const colors: Record<ApplicationStatus, string> = {
      [ApplicationStatus.DRAFT]: '#6b7280',
      [ApplicationStatus.APPLIED]: '#3b82f6',
      [ApplicationStatus.PHONE_SCREEN]: '#8b5cf6',
      [ApplicationStatus.INTERVIEW]: '#f59e0b',
      [ApplicationStatus.TECHNICAL]: '#f97316',
      [ApplicationStatus.FINAL_ROUND]: '#ef4444',
      [ApplicationStatus.OFFER]: '#10b981',
      [ApplicationStatus.REJECTED]: '#dc2626',
      [ApplicationStatus.WITHDRAWN]: '#6b7280'
    };
    return colors[status];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="application-list">
      <div className="list-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by company, position, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            {Object.entries(StatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as 'dateApplied' | 'company' | 'status');
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="sort-select"
          >
            <option value="dateApplied-desc">Date Applied (Newest)</option>
            <option value="dateApplied-asc">Date Applied (Oldest)</option>
            <option value="company-asc">Company (A-Z)</option>
            <option value="company-desc">Company (Z-A)</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="status-desc">Status (Z-A)</option>
          </select>
        </div>
      </div>

      <div className="applications-count">
        Showing {filteredApplications.length} of {applications.length} applications
      </div>

      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          <p>No applications found.</p>
          {searchTerm || statusFilter !== 'all' ? (
            <p>Try adjusting your search or filters.</p>
          ) : (
            <p>Add your first job application to get started!</p>
          )}
        </div>
      ) : (
        <div className="applications-grid">
          {filteredApplications.map((app) => (
            <div key={app.id} className="application-card">
              <div className="card-header">
                <h3>{app.company}</h3>
                <div className="card-actions">
                  <button
                    onClick={() => onEdit(app)}
                    className="btn-icon"
                    title="Edit application"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(app.id)}
                    className="btn-icon delete"
                    title="Delete application"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="card-content">
                <p className="position">{app.position}</p>
                {app.location && <p className="location">📍 {app.location}</p>}
                {app.salary && <p className="salary">💰 {app.salary}</p>}
                <p className="date">📅 Applied: {formatDate(app.dateApplied)}</p>
                
                <div className="status-section">
                  <label>Status:</label>
                  <select
                    value={app.status}
                    onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                    className="status-select"
                    style={{ borderColor: getStatusColor(app.status) }}
                  >
                    {Object.entries(StatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {app.contactPerson && (
                  <p className="contact">👤 {app.contactPerson}</p>
                )}
                
                {app.jobUrl && (
                  <a 
                    href={app.jobUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="job-link"
                  >
                    🔗 View Job Posting
                  </a>
                )}
                
                {app.notes && (
                  <div className="notes">
                    <strong>Notes:</strong>
                    <p>{app.notes}</p>
                  </div>
                )}

                {app.aiAnalyzedAt && (
                  <div className="ai-info">
                    <h4>🤖 AI Analysis</h4>
                    
                    {app.techStack && Array.isArray(app.techStack) && app.techStack.length > 0 && (
                      <div className="tech-stack">
                        {app.techStack.map((tech, index) => (
                          <span key={index} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="work-info">
                      {app.jobType && <span>📋 {app.jobType}</span>}
                      {app.workMode && <span>🏠 {app.workMode}</span>}
                      {app.experienceRequired && <span>⏱️ {app.experienceRequired}</span>}
                    </div>
                    
                    {app.applicationDeadline && (
                      <p className="deadline">⏰ Deadline: {formatDate(app.applicationDeadline)}</p>
                    )}
                    
                    {app.aiAnalysisConfidence && (
                      <div className="ai-confidence-badge">
                        🎯 {Math.round(app.aiAnalysisConfidence * 100)}% confidence
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};