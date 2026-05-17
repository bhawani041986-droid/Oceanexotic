import api from "./api";

export const reviewService = {
  // Reputation Monitoring: Fetch reviews for a specific asset
  getProductReviews: async (productId: string) => {
    const response = await api.get(`/reviews/product.php?product_id=${productId}`);
    return response.data;
  },

  // Trust Calibration: Fetch overall reputation for a merchant
  getSellerReviews: async (sellerId: string) => {
    const response = await api.get(`/reviews/seller.php?seller_id=${sellerId}`);
    return response.data;
  },

  // Quality Feedback: Record a new feedback directive
  submitReview: async (reviewData: any) => {
    const response = await api.post("/reviews/create.php", reviewData);
    return response.data;
  },

  // Governance: Flag or delete non-compliant feedback (Admins)
  moderateReview: async (id: string, action: string) => {
    // Send BOTH id and action in the POST body — moderate.php reads from php://input
    const response = await api.post(`/reviews/moderate.php`, { id, action });
    return response.data;
  },

  // Authority Registry: Fetch all reviews for moderation (Admins)
  getModerationQueue: async () => {
    const response = await api.get("/reviews/all.php");
    return response.data;
  },

  // Merchant Response: Sellers replying to approved commendations
  respondToReview: async (id: string, responseText: string) => {
    const response = await api.post("/reviews/respond.php", { id, response: responseText });
    return response.data;
  },

  // Citizen Audit: Fetch review history for a specific customer
  getUserReviews: async (userId: string) => {
    const response = await api.get(`/reviews/user.php?user_id=${userId}`);
    return response.data;
  },

  // Order Integrity: Check reviews for a specific order
  getOrderReviews: async (orderId: string) => {
    const response = await api.get(`/reviews/order.php?order_id=${orderId}`);
    return response.data;
  }
};
