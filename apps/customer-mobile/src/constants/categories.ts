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

/** Mirrors `CATEGORIES` in `src/app/customer/page.tsx` */
export const CATEGORIES: Category[] = [
  { name: "Red Snapper",   image: IMG_SNAPPER,  slug: "snapper",  glowColor: "#e11d48" },
  { name: "Kingfish",      image: IMG_KINGFISH, slug: "kingfish", glowColor: "#3b82f6" },
  { name: "White Pomfret", image: IMG_POMFRET,  slug: "pomfret",  glowColor: "#cbd5e1" },
  { name: "Grouper",       image: IMG_GROUPER,  slug: "grouper",  glowColor: "#92400e" },
  { name: "Mackerel",      image: IMG_MACKEREL, slug: "mackerel", glowColor: "#06b6d4" },
  { name: "Tiger Prawns",  image: IMG_PRAWNS,   slug: "prawns",   glowColor: "#f97316" },
  { name: "Mud Crab",      image: IMG_CRAB,     slug: "crab",     glowColor: "#065f46" },
  { name: "Spiny Lobster", image: IMG_LOBSTER,  slug: "lobster",  glowColor: "#b91c1c" },
];
