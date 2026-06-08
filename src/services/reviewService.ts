import api from "./api";

export const reviewService = {
  // Reputation Monitoring: Fetch reviews for a specific asset
  getProductReviews: async (productId: string) => {
    const response = await api.get(`/reviews/product?product_id=${productId}`);
    return response.data;
  },

  // Trust Calibration: Fetch overall reputation for a merchant
  getSellerReviews: async (sellerId: string) => {
    const response = await api.get(`/reviews/seller?seller_id=${sellerId}`);
    return response.data;
  },

  // Quality Feedback: Record a new feedback directive
  submitReview: async (reviewData: any) => {
    const response = await api.post("/reviews/create", reviewData);
    return response.data;
  },

  // Governance: Flag or delete non-compliant feedback (Admins)
  moderateReview: async (id: string, action: string) => {
    // Send BOTH id and action in the POST body — moderate.php reads from php://input
    const response = await api.post(`/reviews/moderate`, { id, action });
    return response.data;
  },

  // Authority Registry: Fetch all reviews for moderation (Admins)
  getModerationQueue: async () => {
    const response = await api.get("/reviews/all");
    return response.data;
  },

  // Merchant Response: Sellers replying to approved commendations
  respondToReview: async (id: string, responseText: string) => {
    const response = await api.post("/reviews/respond", { id, response: responseText });
    return response.data;
  },

  // Citizen Audit: Fetch review history for a specific customer
  getUserReviews: async (userId: string) => {
    const response = await api.get(`/reviews/user?user_id=${userId}`);
    return response.data;
  },

  // Order Integrity: Check reviews for a specific order
  getOrderReviews: async (orderId: string) => {
    const response = await api.get(`/reviews/order?order_id=${orderId}`);
    return response.data;
  }
};
