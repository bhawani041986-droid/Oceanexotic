"use client";

import CustomerHomePage from './customer/page';
import MainLayout from '@/components/layouts/MainLayout';

export default function HomePage() {
  // Render the storefront natively on the root domain wrapped in MainLayout
  // to ensure headers, bottom navigation, and layout match /customer.
  return (
     <MainLayout>
        <CustomerHomePage />
     </MainLayout>
  );
}
