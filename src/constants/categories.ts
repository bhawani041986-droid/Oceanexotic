export const PRODUCT_CATEGORIES = [
  { id: 'FRESHWATER FISH', label: 'Freshwater Fish', iconName: 'Fish' },
  { id: 'SEAWATER FISH', label: 'Seawater Fish', iconName: 'Anchor' },
  { id: 'PRAWNS & SHRIMPS', label: 'Prawns & Shrimps', iconName: 'Activity' },
  { id: 'CRABS & LOBSTERS', label: 'Crabs & Lobsters', iconName: 'Compass' },
  { id: 'STEAKS & FILLETS', label: 'Premium Steaks & Fillets', iconName: 'Star' },
  { id: 'FROZEN', label: 'Frozen Seafood', iconName: 'Snowflake' },
  { id: 'DRY FISH', label: 'Dry Fish', iconName: 'Leaf' },
  { id: 'READY TO COOK', label: 'Ready To Cook', iconName: 'Zap' }
];

// Flat array of just the IDs (for simple dropdowns/validations)
export const CATEGORY_IDS = PRODUCT_CATEGORIES.map(c => c.id);
