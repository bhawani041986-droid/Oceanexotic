import { ImageRequireSource } from "react-native";

/**
 * IMPORTANT: Each require() MUST be a top-level static call.
 * Metro's static asset resolver cannot analyse require() inside
 * array/object literals at parse time — hoisting to named consts
 * forces Metro to register and bundle each asset correctly.
 */
const IMG_SNAPPER: ImageRequireSource = require("../../assets/ICONS/Red-snapper.webp");
const IMG_KINGFISH: ImageRequireSource = require("../../assets/ICONS/kingfish.webp");
const IMG_POMFRET: ImageRequireSource = require("../../assets/ICONS/white-pomfret.webp");
const IMG_GROUPER: ImageRequireSource = require("../../assets/ICONS/grouper.webp");
const IMG_MACKEREL: ImageRequireSource = require("../../assets/ICONS/mackerel.webp");
const IMG_PRAWNS: ImageRequireSource = require("../../assets/ICONS/tiger-prawns.webp");
const IMG_CRAB: ImageRequireSource = require("../../assets/ICONS/mud-cram.webp");
const IMG_LOBSTER: ImageRequireSource = require("../../assets/ICONS/spiny-lobster.webp");
const IMG_MUTTON: ImageRequireSource = require("../../assets/ICONS/mutton.png");
const IMG_CHICKEN: ImageRequireSource = require("../../assets/ICONS/chicken.png");

export interface Category {
  name: string;
  image: ImageRequireSource;
  slug: string;
  glowColor: string;
}

export const CATEGORIES: Category[] = [
  { name: "Seawater Fish",   image: IMG_SNAPPER,  slug: "seawater",  glowColor: "#e11d48" },
  { name: "Freshwater Fish", image: IMG_MACKEREL, slug: "freshwater", glowColor: "#06b6d4" },
  { name: "Prawns & Shrimps",image: IMG_PRAWNS,   slug: "prawns",     glowColor: "#f97316" },
  { name: "Crabs & Lobsters",image: IMG_CRAB,     slug: "crustaceans", glowColor: "#065f46" },
  { name: "Steaks & Fillets",image: IMG_KINGFISH, slug: "fillets",    glowColor: "#3b82f6" },
  { name: "Exotic Catch",    image: IMG_LOBSTER,  slug: "exotic",     glowColor: "#b91c1c" },
  { name: "Ready to Cook",   image: IMG_GROUPER,  slug: "ready-to-cook", glowColor: "#92400e" },
  { name: "Coastal Dry Fish",image: IMG_POMFRET,  slug: "dry-fish",   glowColor: "#cbd5e1" },
  { name: "Mutton",          image: IMG_MUTTON,   slug: "mutton",     glowColor: "#f43f5e" },
  { name: "Chicken",         image: IMG_CHICKEN,  slug: "chicken",    glowColor: "#fbbf24" },
];

export const BACKEND_SLUG_MAP: Record<string, string> = {
  "SEAWATER_FISH": "seawater",
  "FRESHWATER_FISH": "freshwater",
  "PRAWNS_SHRIMPS": "prawns",
  "CRABS_LOBSTERS": "crustaceans",
  "STEAKS_FILLETS": "fillets",
  "EXOTIC_CATCH": "exotic",
  "READY_TO_COOK": "ready-to-cook",
  "DRY_FISH": "dry-fish",
  "MUTTON": "mutton",
  "CHICKEN": "chicken"
};

export function getSortedCategories(dbCategories?: { id: string; label: string; status: string }[]): Category[] {
  if (!dbCategories || dbCategories.length === 0) {
    return CATEGORIES;
  }
  
  const activeDbCategories = dbCategories.filter(c => c.status === "ACTIVE" || !c.status);
  const sorted: Category[] = [];

  activeDbCategories.forEach(dbCat => {
    const slug = BACKEND_SLUG_MAP[dbCat.id] || dbCat.id.toLowerCase();
    const found = CATEGORIES.find(c => c.slug === slug);
    if (found) {
      sorted.push(found);
    }
  });

  // Append any local categories not present in DB list just in case
  CATEGORIES.forEach(localCat => {
    if (!sorted.find(s => s.slug === localCat.slug)) {
      sorted.push(localCat);
    }
  });

  return sorted;
}
