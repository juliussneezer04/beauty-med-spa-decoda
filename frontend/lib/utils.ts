import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { APP_COLORS } from "./colors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1) + "T";
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toString();
}

// Helper function to convert cents to dollars
export function centsToDollars(cents: number): number {
  return cents / 100;
}

// Format currency
export function formatCurrency(cents: number): string {
  return `$${centsToDollars(cents).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

// Format number short for K, M, B, T
export function formatNumberShort(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1) + "T";
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toString();
}

// Specialty assignment function for providers
const SPECIALTIES = [
  "Aesthetic Medicine",
  "Dermatology",
  "Plastic Surgery",
  "Cosmetic Nursing",
  "Medical Aesthetics",
  "Laser Specialist",
];

export function getProviderSpecialty(providerId: string): string {
  // Use provider ID to deterministically assign a specialty
  const hash = providerId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return SPECIALTIES[hash % SPECIALTIES.length];
}

// Map hex colors to Tailwind color classes
const COLOR_CLASSES = [
  { bg: "bg-yellow-50", text: "text-yellow-700" }, // #0ea5e9
  { bg: "bg-purple-50", text: "text-purple-700" }, // #a855f7
  { bg: "bg-amber-50", text: "text-amber-700" }, // #f59e0b
  { bg: "bg-emerald-50", text: "text-emerald-700" }, // #10b981
  { bg: "bg-red-50", text: "text-red-700" }, // #ef4444
  { bg: "bg-violet-50", text: "text-violet-700" }, // #8b5cf6
  { bg: "bg-cyan-50", text: "text-cyan-700" }, // #06b6d4
  { bg: "bg-pink-50", text: "text-pink-700" }, // #ec4899
];

// Get color classes for a source string using APP_COLORS mapping
export function getSourceColorClasses(source: string): string {
  // Use source string to deterministically assign a color
  const hash = source
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % APP_COLORS.length;
  const colorClass = COLOR_CLASSES[colorIndex];
  return `${colorClass.bg} ${colorClass.text}`;
}
