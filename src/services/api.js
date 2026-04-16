const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Scholarships API
  async getScholarships() {
    return this.request('/scholarships');
  }

  async getScholarship(id) {
    return this.request(`/scholarships/${id}`);
  }

  async createScholarship(scholarshipData) {
    return this.request('/scholarships', {
      method: 'POST',
      body: JSON.stringify(scholarshipData),
    });
  }

  async updateScholarship(id, scholarshipData) {
    return this.request(`/scholarships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scholarshipData),
    });
  }

  async deleteScholarship(id) {
    return this.request(`/scholarships/${id}`, {
      method: 'DELETE',
    });
  }

  // Applications API
  async getApplications() {
    return this.request('/applications');
  }

  async getStudentApplications(studentId) {
    return this.request(`/applications/student/${studentId}`);
  }

  async getApplication(id) {
    return this.request(`/applications/${id}`);
  }

  async createApplication(applicationData) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateApplication(id, applicationData) {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(applicationData),
    });
  }

  async deleteApplication(id) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  async getApplicationStats() {
    return this.request('/applications/stats/summary');
  }

  // Notifications API
  async getUserNotifications(userId) {
    return this.request(`/notifications/user/${userId}`);
  }

  async getUnreadNotificationsCount(userId) {
    return this.request(`/notifications/user/${userId}/unread-count`);
  }

  async createNotification(notificationData) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(userId) {
    return this.request(`/notifications/user/${userId}/read-all`, {
      method: 'PUT',
    });
  }

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents API
  async getApplicationDocuments(applicationId) {
    return this.request(`/documents/application/${applicationId}`);
  }

  async getDocument(id) {
    return this.request(`/documents/${id}`);
  }

  async uploadDocument(documentData) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async updateDocument(id, documentData) {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  }

  async deleteDocument(id) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
