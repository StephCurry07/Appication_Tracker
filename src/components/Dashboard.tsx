import React from 'react';
import { JobApplication, ApplicationStatus, StatusLabels } from '../types';

interface DashboardProps {
  applications: JobApplication[];
}

export const Dashboard: React.FC<DashboardProps> = ({ applications }) => {
  const getStatusCount = (status: ApplicationStatus): number => {
    return applications.filter(app => app.status === status).length;
  };

  const getTotalApplications = (): number => applications.length;

  const getActiveApplications = (): number => {
    return applications.filter(app => 
      ![ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN, ApplicationStatus.OFFER].includes(app.status)
    ).length;
  };

  const getRecentApplications = (): JobApplication[] => {
    return applications
      .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())
      .slice(0, 5);
  };

  const getApplicationsThisWeek = (): number => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return applications.filter(app => 
      new Date(app.dateApplied) >= oneWeekAgo
    ).length;
  };

  const getSuccessRate = (): string => {
    const totalApplied = applications.filter(app => app.status !== ApplicationStatus.DRAFT).length;
    const offers = getStatusCount(ApplicationStatus.OFFER);
    
    if (totalApplied === 0) return '0%';
    return `${Math.round((offers / totalApplied) * 100)}%`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

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

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Applications</h3>
          <div className="stat-number">{getTotalApplications()}</div>
        </div>
        
        <div className="stat-card">
          <h3>Active Applications</h3>
          <div className="stat-number">{getActiveApplications()}</div>
        </div>
        
        <div className="stat-card">
          <h3>This Week</h3>
          <div className="stat-number">{getApplicationsThisWeek()}</div>
        </div>
        
        <div className="stat-card">
          <h3>Success Rate</h3>
          <div className="stat-number">{getSuccessRate()}</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="status-breakdown">
          <h3>Status Breakdown</h3>
          <div className="status-list">
            {Object.entries(StatusLabels).map(([status, label]) => {
              const count = getStatusCount(status as ApplicationStatus);
              return (
                <div key={status} className="status-item">
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(status as ApplicationStatus) }}
                  ></div>
                  <span className="status-label">{label}</span>
                  <span className="status-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="recent-applications">
          <h3>Recent Applications</h3>
          {getRecentApplications().length === 0 ? (
            <p className="empty-message">No applications yet. Add your first application!</p>
          ) : (
            <div className="recent-list">
              {getRecentApplications().map((app) => (
                <div key={app.id} className="recent-item">
                  <div className="recent-info">
                    <strong>{app.company}</strong>
                    <span className="recent-position">{app.position}</span>
                    <span className="recent-date">{formatDate(app.dateApplied)}</span>
                  </div>
                  <div 
                    className="recent-status"
                    style={{ color: getStatusColor(app.status) }}
                  >
                    {StatusLabels[app.status]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};