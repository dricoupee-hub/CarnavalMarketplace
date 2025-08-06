// frontend-api.js - API integration for the carnival marketplace frontend

class CarnivalAPI {
  constructor(baseURL = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('carnival-token');
  }

  // Helper method to make authenticated requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.token) {
        this.setToken(response.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.token) {
        this.setToken(response.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  // Token management
  setToken(token) {
    this.token = token;
    localStorage.setItem('carnival-token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('carnival-token');
  }

  // Carnival groups methods
  async getCarnivalGroups() {
    return await this.request('/carnival-groups');
  }

  async getCarnivalGroup(id) {
    return await this.request(`/carnival-groups/${id}`);
  }

  // Product methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return await this.request(endpoint);
  }

  async getProduct(id) {
    return await this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(productData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, productData[key]);
      }
    });

    // Append images
    if (productData.images) {
      Array.from(productData.images).forEach(image => {
        formData.append('images', image);
      });
    }

    return await this.request('/products', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData - let browser set it with boundary
        Authorization: `Bearer ${this.token}`
      },
      body: formData
    });
  }

  async updateProduct(id, productData) {
    return await this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return await this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  async getUserProducts(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products/user/${userId}?${queryString}` : `/products/user/${userId}`;
    return await this.request(endpoint);
  }

  // Payment methods
  async createPaymentIntent(productId, shippingAddress) {
    return await this.request('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ productId, shippingAddress })
    });
  }

  async confirmPayment(paymentIntentId, paymentMethodType) {
    return await this.request('/payments/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, paymentMethodType })
    });
  }

  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/payments/orders?${queryString}` : '/payments/orders';
    return await this.request(endpoint);
  }

  async getOrder(id) {
    return await this.request(`/payments/orders/${id}`);
  }

  async updateOrderStatus(id, status) {
    return await this.request(`/payments/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // User methods
  async getUserProfile() {
    return await this.request('/users/profile');
  }

  async updateUserProfile(userData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async changePassword(currentPassword, newPassword) {
    return await this.request('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async getUserDashboard() {
    return await this.request('/users/dashboard');
  }

  async getPublicUserProfile(userId) {
    return await this.request(`/users/${userId}/public`);
  }

  // Helper method to check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Helper method to handle API errors in UI
  handleError(error) {
    if (error.message.includes('Token expired') || error.message.includes('Invalid token')) {
      this.clearToken();
      window.location.href = '/login'; // Redirect to login
    }
    return error.message;
  }
}

// Initialize API instance
const api = new CarnivalAPI();

// Example usage functions for the frontend
const CarnivalUI = {
  // Show loading spinner
  showLoading(element) {
    if (element) {
      element.innerHTML = '<div class="spinner">Loading...</div>';
    }
  },

  // Hide loading spinner
  hideLoading() {
    const spinners = document.querySelectorAll('.spinner');
    spinners.forEach(spinner => spinner.remove());
  },

  // Display error message
  showError(message, container = document.body) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      background: #fee;
      border: 1px solid #fcc;
      color: #c33;
      padding: 10px;
      border-radius: 5px;
      margin: 10px 0;
    `;
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
  },

  // Display success message
  showSuccess(message, container = document.body) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
      background: #efe;
      border: 1px solid #cfc;
      color: #3c3;
      padding: 10px;
      border-radius: 5px;
      margin: 10px 0;
    `;
    successDiv.textContent = message;
    container.insertBefore(successDiv, container.firstChild);

    // Auto-remove after 3 seconds
    setTimeout(() => successDiv.remove(), 3000);
  },

  // Update authentication UI state
  updateAuthUI(isAuthenticated, user = null) {
    const loginBtn = document.querySelector('[onclick="showLogin()"]');
    const signupBtn = document.querySelector('[onclick="showSignup()"]');
    const sellBtn = document.querySelector('[onclick="showSellModal()"]');
    
    if (isAuthenticated && user) {
      // Hide login/signup, show user menu
      if (loginBtn) loginBtn.style.display = 'none';
      if (signupBtn) signupBtn.style.display = 'none';
      if (sellBtn) sellBtn.style.display = 'inline-block';

      // Show user greeting
      const userGreeting = document.createElement('span');
      userGreeting.textContent = `Welcome, ${user.firstName}!`;
      userGreeting.style.marginRight = '15px';
      
      if (loginBtn && loginBtn.parentNode) {
        loginBtn.parentNode.insertBefore(userGreeting, loginBtn);
      }
    } else {
      // Show login/signup, hide sell button
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (signupBtn) signupBtn.style.display = 'inline-block';
      if (sellBtn) sellBtn.style.display = 'none';
    }
  }
};

// Initialize authentication state on page load
document.addEventListener('DOMContentLoaded', async () => {
  if (api.isAuthenticated()) {
    try {
      const response = await api.getCurrentUser();
      CarnivalUI.updateAuthUI(true, response.user);
    } catch (error) {
      console.error('Authentication check failed:', error);
      api.clearToken();
      CarnivalUI.updateAuthUI(false);
    }
  }
});

// Export for use in HTML
window.api = api;
window.CarnivalUI = CarnivalUI;