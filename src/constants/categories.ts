export const PRODUCT_CATEGORIES = [
  { id: 'FRESHWATER FISH', label: 'Freshwater Fish', iconName: 'Fish', status: 'ACTIVE' },
  { id: 'SEAWATER FISH', label: 'Seawater Fish', iconName: 'Anchor', status: 'ACTIVE' },
  { id: 'PRAWNS & SHRIMPS', label: 'Prawns & Shrimps', iconName: 'Activity', status: 'ACTIVE' },
  { id: 'CRABS & LOBSTERS', label: 'Crabs & Lobsters', iconName: 'Compass', status: 'ACTIVE' },
  { id: 'STEAKS & FILLETS', label: 'Premium Steaks & Fillets', iconName: 'Star', status: 'ACTIVE' },
  { id: 'FROZEN', label: 'Frozen Seafood', iconName: 'Snowflake', status: 'ACTIVE' },
  { id: 'DRY FISH', label: 'Dry Fish', iconName: 'Leaf', status: 'ACTIVE' },
  { id: 'READY TO COOK', label: 'Ready To Cook', iconName: 'Zap', status: 'ACTIVE' },
  { id: 'MUTTON', label: 'Mutton', iconName: 'Beef', status: 'ACTIVE' },
  { id: 'CHICKEN', label: 'Chicken', iconName: 'Utensils', status: 'ACTIVE' }
];

// Flat array of just the IDs (for simple dropdowns/validations)
export const CATEGORY_IDS = PRODUCT_CATEGORIES.map(c => c.id);
