import api from './api';

export const userService = {
  // Identity coordinates: Fetch saved addresses
  getAddresses: async (userId: string) => {
    try {
      const response = await api.get(`/user/addresses.php?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  },

  // Sovereign registration: Save new coordinates
  saveAddress: async (addressData: any) => {
    const response = await api.post('/user/save_address.php', addressData);
    return response.data;
  }
};
