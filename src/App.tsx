import { useState } from 'react';
import { JobApplication, ApplicationStatus } from './types';
import { useSupabaseApplications } from './hooks/useSupabaseApplications';
import { Dashboard } from './components/Dashboard';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationList } from './components/ApplicationList';
import { AuthForm } from './components/AuthForm';
import './App.css';

type View = 'dashboard' | 'list' | 'add' | 'edit';

function App() {
  const {
    applications,
    loading,
    error,
    user,
    addApplication,
    updateApplication,
    deleteApplication,
    clearAllApplications,
    signInWithEmail,
    signUpWithEmail,
    signOut
  } = useSupabaseApplications();

  // Use sessionStorage to persist navigation only within the same tab session
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = sessionStorage.getItem('currentView');
    return (saved as View) || 'dashboard';
  });
  
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);

  // Save current view to sessionStorage (clears when tab closes)
  const handleViewChange = (view: View) => {
    setCurrentView(view);
    sessionStorage.setItem('currentView', view);
    // Clear editing state when changing views
    if (view !== 'edit') {
      setEditingApplication(null);
    }
  };

  const handleAddApplication = (applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    addApplication(applicationData);
    handleViewChange('list');
  };

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application);
    handleViewChange('edit');
  };

  const handleUpdateApplication = (applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingApplication) {
      updateApplication(editingApplication.id, applicationData);
      setEditingApplication(null);
      handleViewChange('list');
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
          onClick={() => handleViewChange('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={currentView === 'list' ? 'nav-link active' : 'nav-link'}
          onClick={() => handleViewChange('list')}
        >
          📋 Applications ({applications.length})
        </button>
        <button
          className={currentView === 'add' ? 'nav-link active' : 'nav-link'}
          onClick={() => handleViewChange('add')}
        >
          ➕ Add New
        </button>
      </div>
      <div className="nav-actions">
        {user && (
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button
              onClick={signOut}
              className="btn-secondary-small"
              title="Sign out"
            >
              🚪 Sign Out
            </button>
          </div>
        )}
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
    // Show authentication form if user is not logged in
    if (!user) {
      return (
        <AuthForm
          onSignIn={signInWithEmail}
          onSignUp={signUpWithEmail}
          loading={loading}
          error={error}
        />
      );
    }

    if (loading) {
      return (
        <div className="loading">
          <p>Loading applications...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
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
      {user && renderNavigation()}
      <main className="main-content">
        {renderContent()}
      </main>
      {user && (
        <footer className="app-footer">
          <p>Data is automatically synced across all your devices with Supabase</p>
        </footer>
      )}
    </div>
  );
}

export default App;