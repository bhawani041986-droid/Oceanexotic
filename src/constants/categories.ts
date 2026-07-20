export const PRODUCT_CATEGORIES = [
  { id: 'FRESHWATER FISH', label: 'Freshwater Fish', iconName: 'Fish', status: 'ACTIVE', imageUrl: '/images/categories/freshwater.png' },
  { id: 'SEAWATER FISH', label: 'Seawater Fish', iconName: 'Anchor', status: 'ACTIVE', imageUrl: '/images/categories/seawater.png' },
  { id: 'PRAWNS & SHRIMPS', label: 'Prawns & Shrimps', iconName: 'Activity', status: 'ACTIVE', imageUrl: '/images/categories/prawns.png' },
  { id: 'CRABS & LOBSTERS', label: 'Crabs & Lobsters', iconName: 'Compass', status: 'ACTIVE', imageUrl: '/images/categories/crabs.png' },
  { id: 'STEAKS & FILLETS', label: 'Premium Steaks & Fillets', iconName: 'Star', status: 'ACTIVE', imageUrl: '/images/categories/steaks.png' },
  { id: 'FROZEN', label: 'Frozen Seafood', iconName: 'Snowflake', status: 'ACTIVE', imageUrl: '/images/categories/exotic.png' },
  { id: 'DRY FISH', label: 'Dry Fish', iconName: 'Leaf', status: 'ACTIVE', imageUrl: '/images/categories/dry_fish.png' },
  { id: 'READY TO COOK', label: 'Ready To Cook', iconName: 'Zap', status: 'ACTIVE', imageUrl: '/images/categories/ready_to_cook.png' },
  { id: 'MUTTON', label: 'Mutton', iconName: 'Beef', status: 'ACTIVE', imageUrl: '/images/categories/mutton.png' },
  { id: 'CHICKEN', label: 'Chicken', iconName: 'Utensils', status: 'ACTIVE', imageUrl: '/images/categories/chicken.png' }
];

// Flat array of just the IDs (for simple dropdowns/validations)
export const CATEGORY_IDS = PRODUCT_CATEGORIES.map(c => c.id);
