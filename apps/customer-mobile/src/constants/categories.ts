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
];
