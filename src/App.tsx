import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus } from './types';
import { loadApplications, saveApplications } from './utils/storage';
import ApplicationList from './components/ApplicationList';
import ApplicationForm from './components/ApplicationForm';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';

function App() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'applications'>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);

  useEffect(() => {
    const loadedApplications = loadApplications();
    setApplications(loadedApplications);
    
    // Listen for applications added by the browser extension
    const handleApplicationAdded = (event: CustomEvent) => {
      const newApplication = event.detail;
      setApplications(prev => {
        // Check if application already exists to avoid duplicates
        const exists = prev.some(app => app.id === newApplication.id);
        if (!exists) {
          return [...prev, newApplication];
        }
        return prev;
      });
    };
    
    window.addEventListener('applicationAdded', handleApplicationAdded as EventListener);
    
    return () => {
      window.removeEventListener('applicationAdded', handleApplicationAdded as EventListener);
    };
  }, []);

  useEffect(() => {
    saveApplications(applications);
  }, [applications]);

  const handleAddApplication = (application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newApplication: JobApplication = {
      ...application,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setApplications(prev => [...prev, newApplication]);
    setShowForm(false);
  };

  const handleUpdateApplication = (updatedApplication: JobApplication) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === updatedApplication.id
          ? { ...updatedApplication, updatedAt: new Date().toISOString() }
          : app
      )
    );
    setEditingApplication(null);
    setShowForm(false);
  };

  const handleDeleteApplication = (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      setApplications(prev => prev.filter(app => app.id !== id));
    }
  };

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingApplication(null);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>Job Application Tracker</h1>
          <nav className="flex flex-center gap-20 mt-20">
            <button
              className={`btn ${currentView === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`btn ${currentView === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('applications')}
            >
              Applications
            </button>
            <button
              className="btn btn-success"
              onClick={() => setShowForm(true)}
            >
              + Add Application
            </button>
          </nav>
        </div>
      </header>

      <main className="container">
        {currentView === 'dashboard' ? (
          <Dashboard applications={applications} />
        ) : (
          <ApplicationList
            applications={applications}
            onEdit={handleEditApplication}
            onDelete={handleDeleteApplication}
            onUpdate={handleUpdateApplication}
          />
        )}
      </main>

      {showForm && (
        <Modal onClose={handleCloseForm}>
          <ApplicationForm
            application={editingApplication}
            onSubmit={editingApplication ? handleUpdateApplication : handleAddApplication}
            onCancel={handleCloseForm}
          />
        </Modal>
      )}
    </div>
  );
}

export default App;