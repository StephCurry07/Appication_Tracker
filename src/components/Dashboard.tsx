import React from 'react';
import { JobApplication, ApplicationStatus } from '../types';
import { formatDate } from '../utils/dateUtils';

interface DashboardProps {
  applications: JobApplication[];
}

const Dashboard: React.FC<DashboardProps> = ({ applications }) => {
  const getStatusCount = (status: ApplicationStatus) => {
    return applications.filter(app => app.status === status).length;
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalApplications = applications.length;
  const activeApplications = applications.filter(app => 
    ![ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN, ApplicationStatus.OFFER_DECLINED].includes(app.status)
  ).length;

  const recentApplications = applications
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const statusStats = Object.values(ApplicationStatus).map(status => ({
    status,
    count: getStatusCount(status),
    label: getStatusLabel(status)
  })).filter(stat => stat.count > 0);

  return (
    <div className="dashboard">
      <div className="grid grid-3 mb-20">
        <div className="card text-center">
          <h3 style={{ color: '#3498db', fontSize: '2rem', marginBottom: '10px' }}>
            {totalApplications}
          </h3>
          <p className="text-muted">Total Applications</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: '#27ae60', fontSize: '2rem', marginBottom: '10px' }}>
            {activeApplications}
          </h3>
          <p className="text-muted">Active Applications</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: '#e74c3c', fontSize: '2rem', marginBottom: '10px' }}>
            {getStatusCount(ApplicationStatus.REJECTED)}
          </h3>
          <p className="text-muted">Rejected</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Status Overview</h3>
          </div>
          <div className="status-overview">
            {statusStats.map(({ status, count, label }) => (
              <div key={status} className="flex flex-between mb-20">
                <div className="flex gap-10">
                  <span className={`status-badge status-${status}`}>
                    {label}
                  </span>
                </div>
                <span className="text-muted">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div className="recent-activity">
            {recentApplications.length === 0 ? (
              <p className="text-muted text-center">No applications yet</p>
            ) : (
              recentApplications.map(app => (
                <div key={app.id} className="flex flex-between mb-20">
                  <div>
                    <div className="card-title" style={{ fontSize: '1rem', marginBottom: '5px' }}>
                      {app.position} at {app.company}
                    </div>
                    <div className="flex gap-10">
                      <span className={`status-badge status-${app.status}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </div>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {formatDate(app.updatedAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;