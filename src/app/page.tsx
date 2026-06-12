import CustomerHomePage from './customer/page';

export default function HomePage() {
  // Render the storefront natively on the root domain to fix the Missing H1 SEO error
  // instead of issuing a 307 redirect.
  return <CustomerHomePage />;
}
