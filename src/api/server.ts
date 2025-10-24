// Simple API server to handle extension communication
// This will run alongside the React app

import { JobApplication } from '../types';
import { loadApplications, saveApplications, generateId } from '../utils/storage';

class APIServer {
  private applications: JobApplication[] = [];

  constructor() {
    this.applications = loadApplications();
    this.setupAPI();
  }

  setupAPI() {
    // Create a simple message-based API using window events
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;
      
      const { type, data, id } = event.data;
      
      switch (type) {
        case 'GET_APPLICATIONS':
          this.handleGetApplications(id);
          break;
        case 'ADD_APPLICATION':
          this.handleAddApplication(data, id);
          break;
        case 'UPDATE_APPLICATION':
          this.handleUpdateApplication(data, id);
          break;
        case 'DELETE_APPLICATION':
          this.handleDeleteApplication(data, id);
          break;
        case 'HEALTH_CHECK':
          this.handleHealthCheck(id);
          break;
      }
    });

    // Also set up a simple HTTP-like interface using fetch interception
    this.setupFetchInterception();
  }

  setupFetchInterception() {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Intercept API calls to our local endpoints
      if (url.includes('/api/')) {
        return this.handleAPIRequest(url, init);
      }
      
      // For all other requests, use original fetch
      return originalFetch(input, init);
    };
  }

  async handleAPIRequest(url: string, init?: RequestInit): Promise<Response> {
    const method = init?.method || 'GET';
    const body = init?.body ? JSON.parse(init.body as string) : null;
    
    try {
      if (url.includes('/api/health')) {
        return new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (url.includes('/api/applications')) {
        if (method === 'GET') {
          return new Response(JSON.stringify(this.applications), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (method === 'POST') {
          const newApplication: JobApplication = {
            id: generateId(),
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Check for duplicates
          const exists = this.applications.some(app => 
            app.company === newApplication.company && 
            app.position === newApplication.position &&
            Math.abs(new Date(app.applicationDate).getTime() - new Date(newApplication.applicationDate).getTime()) < 24 * 60 * 60 * 1000
          );
          
          if (!exists) {
            this.applications.push(newApplication);
            saveApplications(this.applications);
            
            // Notify the React app about the new application
            window.dispatchEvent(new CustomEvent('applicationAdded', { 
              detail: newApplication 
            }));
          }
          
          return new Response(JSON.stringify(newApplication), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  handleGetApplications(requestId: string) {
    window.postMessage({
      type: 'API_RESPONSE',
      id: requestId,
      data: this.applications
    }, window.location.origin);
  }

  handleAddApplication(applicationData: any, requestId: string) {
    const newApplication: JobApplication = {
      id: generateId(),
      ...applicationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.applications.push(newApplication);
    saveApplications(this.applications);
    
    window.postMessage({
      type: 'API_RESPONSE',
      id: requestId,
      data: newApplication
    }, window.location.origin);
    
    // Notify React app
    window.dispatchEvent(new CustomEvent('applicationAdded', { 
      detail: newApplication 
    }));
  }

  handleUpdateApplication(applicationData: JobApplication, requestId: string) {
    const index = this.applications.findIndex(app => app.id === applicationData.id);
    if (index !== -1) {
      this.applications[index] = {
        ...applicationData,
        updatedAt: new Date().toISOString()
      };
      saveApplications(this.applications);
    }
    
    window.postMessage({
      type: 'API_RESPONSE',
      id: requestId,
      data: this.applications[index]
    }, window.location.origin);
  }

  handleDeleteApplication(applicationId: string, requestId: string) {
    this.applications = this.applications.filter(app => app.id !== applicationId);
    saveApplications(this.applications);
    
    window.postMessage({
      type: 'API_RESPONSE',
      id: requestId,
      data: { success: true }
    }, window.location.origin);
  }

  handleHealthCheck(requestId: string) {
    window.postMessage({
      type: 'API_RESPONSE',
      id: requestId,
      data: { status: 'ok', timestamp: new Date().toISOString() }
    }, window.location.origin);
  }
}

// Initialize API server
export const apiServer = new APIServer();