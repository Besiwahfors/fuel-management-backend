export const FUEL_TYPES = ['petrol', 'diesel', 'premium', 'electric'] as const;

export type FuelType = (typeof FUEL_TYPES)[number];
