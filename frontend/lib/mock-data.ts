// Helper function to convert cents to dollars
export function centsToDollars(cents: number): number {
  return cents / 100;
}

// Format currency
export function formatCurrency(cents: number): string {
  return `$${centsToDollars(cents).toFixed(2)}`;
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
