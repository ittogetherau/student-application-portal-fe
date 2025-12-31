// API Configuration for FastAPI Backend Integration
// Replace with your actual FastAPI backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// Authentication API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  logout: () =>
    apiRequest('/auth/logout', { method: 'POST' }),
  
  getCurrentUser: () =>
    apiRequest('/auth/me', { method: 'GET' }),
};

// Application API
export const applicationApi = {
  // List applications with filters
  list: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/applications${queryString}`, { method: 'GET' });
  },

  // Get single application
  get: (id: string) =>
    apiRequest(`/applications/${id}`, { method: 'GET' }),

  // Create application
  create: (data: any) =>
    apiRequest('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update application
  update: (id: string, data: any) =>
    apiRequest(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Update application status
  updateStatus: (id: string, status: string) =>
    apiRequest(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Get application activities
  getActivities: (id: string) =>
    apiRequest(`/applications/${id}/activities`, { method: 'GET' }),

  // Track application (public endpoint)
  track: (trackingId: string) =>
    apiRequest(`/applications/track/${trackingId}`, { method: 'GET' }),
};

// Document API
export const documentApi = {
  // Upload document
  upload: async (file: File, applicationId: string, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('application_id', applicationId);
    formData.append('type', type);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  // Process document with OCR
  processOCR: (documentId: string) =>
    apiRequest(`/documents/${documentId}/ocr`, { method: 'POST' }),

  // Get document
  get: (id: string) =>
    apiRequest(`/documents/${id}`, { method: 'GET' }),

  // List documents for application
  listByApplication: (applicationId: string) =>
    apiRequest(`/documents/application/${applicationId}`, { method: 'GET' }),

  // Delete document
  delete: (id: string) =>
    apiRequest(`/documents/${id}`, { method: 'DELETE' }),
};

// GS Document API
export const gsDocumentApi = {
  // Upload GS document
  upload: async (file: File, applicationId: string, category: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('application_id', applicationId);
    formData.append('category', category);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/gs-documents/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  // List GS documents for application
  listByApplication: (applicationId: string) =>
    apiRequest(`/gs-documents/application/${applicationId}`, { method: 'GET' }),

  // Verify GS document
  verify: (id: string, verified: boolean) =>
    apiRequest(`/gs-documents/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verified }),
    }),
};

// Interview API
export const interviewApi = {
  // Schedule interview
  schedule: (data: any) =>
    apiRequest('/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get interview
  get: (id: string) =>
    apiRequest(`/interviews/${id}`, { method: 'GET' }),

  // Update interview assessment
  updateAssessment: (id: string, assessment: any) =>
    apiRequest(`/interviews/${id}/assessment`, {
      method: 'PATCH',
      body: JSON.stringify(assessment),
    }),

  // Complete interview
  complete: (id: string, outcome: string, notes?: string) =>
    apiRequest(`/interviews/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ outcome, notes }),
    }),

  // List interviews
  list: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/interviews${queryString}`, { method: 'GET' });
  },
};

// Offer API
export const offerApi = {
  // Generate offer letter
  generate: (applicationId: string, templateData: any) =>
    apiRequest('/offers/generate', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, ...templateData }),
    }),

  // Get offer
  get: (id: string) =>
    apiRequest(`/offers/${id}`, { method: 'GET' }),

  // Get offer by tracking ID (public)
  getByTracking: (trackingId: string) =>
    apiRequest(`/offers/track/${trackingId}`, { method: 'GET' }),

  // Sign offer
  sign: (id: string, signature: string) =>
    apiRequest(`/offers/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    }),

  // Decline offer
  decline: (id: string, reason?: string) =>
    apiRequest(`/offers/${id}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// COE API
export const coeApi = {
  // Upload COE
  upload: async (file: File, applicationId: string, coeNumber: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('application_id', applicationId);
    formData.append('coe_number', coeNumber);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/coe/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  // Get COE
  get: (id: string) =>
    apiRequest(`/coe/${id}`, { method: 'GET' }),

  // List COEs
  list: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/coe${queryString}`, { method: 'GET' });
  },

  // Send COE to agent
  sendToAgent: (id: string) =>
    apiRequest(`/coe/${id}/send`, { method: 'POST' }),
};

// Notification API
export const notificationApi = {
  // List notifications
  list: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/notifications${queryString}`, { method: 'GET' });
  },

  // Mark as read
  markAsRead: (id: string) =>
    apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Mark all as read
  markAllAsRead: () =>
    apiRequest('/notifications/read-all', { method: 'PATCH' }),

  // Get unread count
  getUnreadCount: () =>
    apiRequest('/notifications/unread-count', { method: 'GET' }),
};

// Dashboard API
export const dashboardApi = {
  // Agent dashboard metrics
  getAgentMetrics: () =>
    apiRequest('/dashboard/agent/metrics', { method: 'GET' }),

  // Staff dashboard metrics
  getStaffMetrics: () =>
    apiRequest('/dashboard/staff/metrics', { method: 'GET' }),

  // Get recent activities
  getRecentActivities: (limit: number = 10) =>
    apiRequest(`/dashboard/activities?limit=${limit}`, { method: 'GET' }),
};

// Chat API
export const chatApi = {
  // Send chat message
  sendMessage: (applicationId: string, message: string, history: any[]) =>
    apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({
        application_id: applicationId,
        message,
        history,
      }),
    }),

  // Get chat history
  getHistory: (applicationId: string) =>
    apiRequest(`/chat/history/${applicationId}`, { method: 'GET' }),
};

// Reports API
export const reportsApi = {
  // Get application statistics
  getStatistics: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/reports/statistics${queryString}`, { method: 'GET' });
  },

  // Export applications
  exportApplications: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/reports/export${queryString}`, { method: 'GET' });
  },

  // Get staff performance
  getStaffPerformance: (staffId?: string) => {
    const queryString = staffId ? `?staff_id=${staffId}` : '';
    return apiRequest(`/reports/staff-performance${queryString}`, { method: 'GET' });
  },
};
