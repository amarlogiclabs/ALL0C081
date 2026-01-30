// Microservice client for communicating with Java microservices
import fetch from 'node-fetch';

const MICROSERVICE_URL = process.env.MICROSERVICE_URL || 'http://localhost:8090';
const USER_SERVICE_BASE = `${MICROSERVICE_URL}/api/users`;

export const userServiceClient = {
  /**
   * Get user by ID from microservice
   */
  async getUserById(userId) {
    try {
      const response = await fetch(`${USER_SERVICE_BASE}/${userId}`);
      if (!response.ok) {
        throw new Error(`User service error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching user from microservice:', error);
      return null;
    }
  },

  /**
   * Get user by email from microservice
   */
  async getUserByEmail(email) {
    try {
      const response = await fetch(`${USER_SERVICE_BASE}/email/${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error(`User service error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching user from microservice:', error);
      return null;
    }
  },

  /**
   * Get user by username from microservice
   */
  async getUserByUsername(username) {
    try {
      const response = await fetch(`${USER_SERVICE_BASE}/username/${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error(`User service error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching user from microservice:', error);
      return null;
    }
  },

  /**
   * Get all users from microservice
   */
  async getAllUsers() {
    try {
      const response = await fetch(USER_SERVICE_BASE);
      if (!response.ok) {
        throw new Error(`User service error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching users from microservice:', error);
      return [];
    }
  },

  /**
   * Create user in microservice
   */
  async createUser(userData) {
    try {
      const response = await fetch(USER_SERVICE_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating user in microservice:', error);
      throw error;
    }
  },

  /**
   * Update user in microservice
   */
  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${USER_SERVICE_BASE}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`User service error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating user in microservice:', error);
      throw error;
    }
  },

  /**
   * Delete user from microservice
   */
  async deleteUser(userId) {
    try {
      const response = await fetch(`${USER_SERVICE_BASE}/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`User service error: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      console.error('Error deleting user from microservice:', error);
      throw error;
    }
  },

  /**
   * Check if microservice is healthy
   */
  async healthCheck() {
    try {
      const response = await fetch(`${USER_SERVICE_BASE}/health/check`);
      return response.ok;
    } catch (error) {
      console.error('Microservice health check failed:', error);
      return false;
    }
  },
};

export default userServiceClient;
