import type { User, UserRole } from "@/store/authStore";

/** Normalize DB roles (CUSTOMER, AGENT, SELLER, ADMIN) to app roles */
export function normalizeRole(role: string): UserRole {
  const r = role.toLowerCase();
  if (r === "admin") return "admin";
  if (r === "seller") return "seller";
  if (r === "agent") return "agent";
  return "customer";
}

/** Post-login routes aligned with web + delivery agent dashboard */
export function getPostLoginRoute(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/(admin)/dashboard";
    case "seller":
      return "/(seller)/dashboard";
    case "agent":
      return "/(agent)/dashboard";
    default:
      return "/home";
  }
}

export function toAuthUser(raw: {
  id: string;
  name: string;
  email: string;
  role: string;
}): User {
  return {
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    role: normalizeRole(raw.role),
  };
}
