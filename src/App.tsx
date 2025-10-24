import { useState } from 'react';
import { JobApplication, ApplicationStatus } from './types';
import { useApplications } from './hooks/useApplications';
import { Dashboard } from './components/Dashboard';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationList } from './components/ApplicationList';
import './App.css';

type View = 'dashboard' | 'list' | 'add' | 'edit';

function App() {
  const {
    applications,
    loading,
    addApplication,
    updateApplication,
    deleteApplication,
    clearAllApplications
  } = useApplications();

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);

  const handleAddApplication = (applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    addApplication(applicationData);
    setCurrentView('list');
  };

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application);
    setCurrentView('edit');
  };

  const handleUpdateApplication = (applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingApplication) {
      updateApplication(editingApplication.id, applicationData);
      setEditingApplication(null);
      setCurrentView('list');
    }
  };

  const handleDeleteApplication = (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      deleteApplication(id);
    }
  };

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    updateApplication(id, { status });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all applications? This cannot be undone.')) {
      clearAllApplications();
    }
  };

  const renderNavigation = () => (
    <nav className="main-nav">
      <div className="nav-brand">
        <h1>Job Application Tracker</h1>
      </div>
      <div className="nav-links">
        <button
          className={currentView === 'dashboard' ? 'nav-link active' : 'nav-link'}
          onClick={() => setCurrentView('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={currentView === 'list' ? 'nav-link active' : 'nav-link'}
          onClick={() => setCurrentView('list')}
        >
          📋 Applications ({applications.length})
        </button>
        <button
          className={currentView === 'add' ? 'nav-link active' : 'nav-link'}
          onClick={() => setCurrentView('add')}
        >
          ➕ Add New
        </button>
      </div>
      <div className="nav-actions">
        {applications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn-danger-small"
            title="Clear all applications"
          >
            🗑️ Clear All
          </button>
        )}
      </div>
    </nav>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <p>Loading applications...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard applications={applications} />;
      
      case 'list':
        return (
          <ApplicationList
            applications={applications}
            onEdit={handleEditApplication}
            onDelete={handleDeleteApplication}
            onStatusChange={handleStatusChange}
          />
        );
      
      case 'add':
        return (
          <ApplicationForm
            onSubmit={handleAddApplication}
            onCancel={() => setCurrentView('dashboard')}
          />
        );
      
      case 'edit':
        return (
          <ApplicationForm
            onSubmit={handleUpdateApplication}
            onCancel={() => {
              setEditingApplication(null);
              setCurrentView('list');
            }}
            initialData={editingApplication || undefined}
          />
        );
      
      default:
        return <Dashboard applications={applications} />;
    }
  };

  return (
    <div className="app">
      {renderNavigation()}
      <main className="main-content">
        {renderContent()}
      </main>
      <footer className="app-footer">
        <p>Data is automatically saved to your browser's local storage</p>
      </footer>
    </div>
  );
}

export default App;