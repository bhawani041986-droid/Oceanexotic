export const APP_NAME = 'OceanFresh';
export const APP_DESCRIPTION = 'Premium Seafood Marketplace';

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/customer/products',
  CART: '/customer/cart',
  PROFILE: '/customer/profile',
  SELLER_DASHBOARD: '/seller/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  }
};

export const CATEGORIES = [
  { id: '1', name: 'Fresh Fish', slug: 'fresh-fish' },
  { id: '2', name: 'Shellfish', slug: 'shellfish' },
  { id: '3', name: 'Crustaceans', slug: 'crustaceans' },
  { id: '4', name: 'Exotic', slug: 'exotic' },
];
