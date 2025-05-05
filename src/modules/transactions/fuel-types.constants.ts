export const FUEL_TYPES = ['PETROL', 'DIESEL', 'PREMIUM', 'ELECTRIC'] as const;

export type FuelType = (typeof FUEL_TYPES)[number];
