import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

const architectureApi = {
  /**
   * Upload and parse a requirement document.
   */
  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await client.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Document upload error:", error);
      throw new Error(
        error.response?.data?.detail ||
        error.message ||
        "Failed to upload document"
      );
    }
  },

  /**
   * Generate architecture recommendation from requirements.
   */
  generateArchitecture: async (requirements) => {
    try {
      const response = await client.post("/architecture/generate", {
        requirements,
      });
      return response.data;
    } catch (error) {
      console.error("Architecture generation error:", error);
      throw new Error(
        error.response?.data?.detail ||
        error.message ||
        "Failed to generate architecture"
      );
    }
  },

  /**
   * Get architecture history with pagination.
   */
  getHistory: async (skip = 0, limit = 50) => {
    try {
      const response = await client.get("/architecture/history", {
        params: { skip, limit },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch history:", error);
      return [];
    }
  },

  /**
   * Get architecture details by ID.
   */
  getArchitectureById: async (id) => {
    try {
      const response = await client.get(`/architecture/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch architecture:", error);
      throw new Error(
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch architecture"
      );
    }
  },

  /**
   * Update architecture status (Draft, Approved, Rejected).
   */
  updateArchitectureStatus: async (id, status) => {
    try {
      const response = await client.patch(`/architecture/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update architecture status:", error);
      throw new Error(
        error.response?.data?.detail ||
        error.message ||
        "Failed to update architecture status"
      );
    }
  },

  /**
   * Regenerate architecture with same requirements.
   */
  regenerateArchitecture: async (id) => {
    try {
      const response = await client.post(`/architecture/${id}/regenerate`);
      return response.data;
    } catch (error) {
      console.error("Failed to regenerate architecture:", error);
      throw new Error(
        error.response?.data?.detail ||
        error.message ||
        "Failed to regenerate architecture"
      );
    }
  },

  /**
   * Get system statistics and overview.
   */
  getSystemStats: async () => {
    try {
      const response = await client.get("/architecture/stats");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch system stats:", error);
      return {
        total_generated: 0,
        avg_confidence: 0,
        retrieval_count: 0,
        retrieval_matches: 0,
        status_distribution: { Draft: 0, Approved: 0, Rejected: 0 },
        recent_activity: [],
      };
    }
  },
};

export default architectureApi;
