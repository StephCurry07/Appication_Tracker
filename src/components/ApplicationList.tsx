import React, { useState } from 'react';
import { JobApplication, ApplicationStatus } from '../types';
import { formatDate } from '../utils/dateUtils';

interface ApplicationListProps {
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void;
  onUpdate: (application: JobApplication) => void;
}

const ApplicationList: React.FC<ApplicationListProps> = ({ applications, onEdit, onDelete, onUpdate }) => {
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const getStatusLabel = (status: ApplicationStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const sortedApplications = filteredApplications.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleCellClick = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const handleCellSave = (application: JobApplication) => {
    if (!editingCell) return;
    
    const updatedApp = {
      ...application,
      [editingCell.field]: editingCell.field === 'status' ? editValue as ApplicationStatus : editValue,
      updatedAt: new Date().toISOString()
    };
    
    onUpdate(updatedApp);
    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, application: JobApplication) => {
    if (e.key === 'Enter') {
      handleCellSave(application);
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const renderEditableCell = (application: JobApplication, field: string, value: string, type: 'text' | 'select' | 'date' = 'text') => {
    const isEditing = editingCell?.id === application.id && editingCell?.field === field;
    
    if (isEditing) {
      if (type === 'select' && field === 'status') {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleCellSave(application)}
            onKeyDown={(e) => handleKeyPress(e, application)}
            autoFocus
            className="form-control"
            style={{ minWidth: '150px' }}
          >
            {Object.values(ApplicationStatus).map(status => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        );
      } else if (type === 'date') {
        return (
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleCellSave(application)}
            onKeyDown={(e) => handleKeyPress(e, application)}
            autoFocus
            className="form-control"
          />
        );
      } else {
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleCellSave(application)}
            onKeyDown={(e) => handleKeyPress(e, application)}
            autoFocus
            className="form-control"
          />
        );
      }
    }

    return (
      <div
        onClick={() => handleCellClick(application.id, field, value)}
        style={{ 
          cursor: 'pointer', 
          padding: '8px', 
          minHeight: '20px',
          borderRadius: '4px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {field === 'status' ? (
          <span className={`status-badge status-${value}`}>
            {getStatusLabel(value as ApplicationStatus)}
          </span>
        ) : field === 'applicationDate' ? (
          formatDate(value)
        ) : (
          value || '-'
        )}
      </div>
    );
  };

  return (
    <div className="application-list">
      <div className="card mb-20">
        <div className="flex flex-between flex-wrap gap-20">
          <div className="form-group" style={{ minWidth: '200px', marginBottom: 0 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by company, position, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ minWidth: '150px', marginBottom: 0 }}>
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              {Object.values(ApplicationStatus).map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {sortedApplications.length === 0 ? (
        <div className="card text-center">
          <p className="text-muted">
            {applications.length === 0 
              ? "No applications yet. Click 'Add Application' to get started!"
              : "No applications match your current filters."
            }
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="applications-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Location</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Salary Range</th>
                <th>Source</th>
                <th>Contact</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedApplications.map(app => (
                <tr key={app.id}>
                  <td>{renderEditableCell(app, 'company', app.company)}</td>
                  <td>{renderEditableCell(app, 'position', app.position)}</td>
                  <td>{renderEditableCell(app, 'location', app.location)}</td>
                  <td>{renderEditableCell(app, 'status', app.status, 'select')}</td>
                  <td>{renderEditableCell(app, 'applicationDate', app.applicationDate, 'date')}</td>
                  <td>{renderEditableCell(app, 'salaryRange', app.salaryRange || '')}</td>
                  <td>{renderEditableCell(app, 'source', app.source)}</td>
                  <td>{renderEditableCell(app, 'contactPerson', app.contactPerson || '')}</td>
                  <td>
                    <div
                      onClick={() => handleCellClick(app.id, 'notes', app.notes)}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '8px', 
                        minHeight: '20px',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title={app.notes}
                    >
                      {editingCell?.id === app.id && editingCell?.field === 'notes' ? (
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCellSave(app)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              handleCellSave(app);
                            } else if (e.key === 'Escape') {
                              handleCellCancel();
                            }
                          }}
                          autoFocus
                          className="form-control"
                          rows={3}
                          style={{ minWidth: '200px' }}
                        />
                      ) : (
                        app.notes || '-'
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-5">
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => onDelete(app.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationList;