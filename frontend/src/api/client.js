/**
 * WellSense AI - Centralized API Client
 */

const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('wellsense_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('wellsense_token', token);
    } else {
      localStorage.removeItem('wellsense_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { detail: `HTTP ${response.status} ${response.statusText}` };
        }
        throw new Error(errorData.detail || 'Network request failed');
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  // Auth Endpoints
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getProfile() {
    return await this.request('/auth/me');
  }

  async getDemoCredentials() {
    return await this.request('/auth/demo-credentials');
  }

  // Model & Prediction
  async getModelInfo() {
    return await this.request('/model-info');
  }

  async predict(featureData) {
    return await this.request('/predict', {
      method: 'POST',
      body: JSON.stringify(featureData),
    });
  }

  // Assessments
  async submitAssessment(featureData) {
    return await this.request('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify({ raw_inputs: featureData }),
    });
  }

  async getAssessmentHistory() {
    return await this.request('/assessments/history');
  }

  async getLatestAssessment() {
    return await this.request('/assessments/latest');
  }

  // Wearables
  async getWearablesStatus() {
    return await this.request('/wearables/status');
  }

  async connectWearable(provider, grantConsent = true) {
    return await this.request('/wearables/connect', {
      method: 'POST',
      body: JSON.stringify({ provider, grant_consent: grantConsent }),
    });
  }

  async syncWearable(provider) {
    return await this.request('/wearables/sync', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  }

  async disconnectWearable(provider) {
    return await this.request('/wearables/disconnect', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  }

  // Counsellor
  async getCounsellorTriageQueue() {
    return await this.request('/counsellor/triage-queue');
  }

  async getAppointments() {
    return await this.request('/counsellor/appointments');
  }

  async bookAppointment(scheduledTime, notes = '', urgency = 'normal') {
    return await this.request('/counsellor/appointments', {
      method: 'POST',
      body: JSON.stringify({ scheduled_time: scheduledTime, notes, urgency }),
    });
  }

  async updateAppointmentStatus(appointmentId, status, notes = null) {
    return await this.request(`/counsellor/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  async saveCounsellorNote(assessmentId, notes) {
    return await this.request('/counsellor/notes', {
      method: 'POST',
      body: JSON.stringify({ assessment_id: assessmentId, notes }),
    });
  }

  // Admin Analytics
  async getAdminOverview() {
    return await this.request('/admin/overview');
  }

  // Privacy & Consent
  async getPrivacySettings() {
    return await this.request('/privacy/settings');
  }

  async updateConsent(consentSettings) {
    return await this.request('/privacy/consent', {
      method: 'POST',
      body: JSON.stringify(consentSettings),
    });
  }

  async exportUserData() {
    return await this.request('/privacy/export-data');
  }

  async deleteAccount() {
    return await this.request('/privacy/delete-account', {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
