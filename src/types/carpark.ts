export type LotType = 'C' | 'Y' | 'H'; // C: Car, Y: Motorcycle, H: Heavy Vehicle

export type AvailabilityStatus = 'plentiful' | 'moderate' | 'critical' | 'full';

export type CarparkAgency = 'HDB' | 'URA' | 'LTA' | 'Commercial';

export interface EVChargerInfo {
  available: boolean;
  operator: 'SP Mobility' | 'CDG ENGIE' | 'Charge+' | 'Shell Recharge' | 'Tesla Supercharger';
  count: number;
  speed: '22kW AC' | '50kW DC' | '120kW DC' | '250kW DC';
}

export interface ParkingRate {
  weekdayDay: string; // e.g., "$1.20 / 30 mins"
  weekdayNight: string; // e.g., "$3.50 / entry (after 18:00)"
  saturday: string;
  sundayPH: string;
  gracePeriodMins: number;
  perHourEstimate: number; // approximate daytime hourly rate for comparison
}

export interface Carpark {
  id: string; // Internal id or Carpark number like "ACB", "C23", "MBS01"
  name: string;
  address: string;
  postalCode: string;
  area: 'CBD & Downtown' | 'Orchard' | 'Marina Bay' | 'Bugis & Bras Basah' | 'HarbourFront & South' | 'West & Jurong' | 'East & Changi' | 'North & Woodlands' | 'North-East & Serangoon';
  agency: CarparkAgency;
  coordinates: {
    lat: number;
    lng: number;
  };
  carLots: {
    total: number;
    available: number;
  };
  motorcycleLots?: {
    total: number;
    available: number;
  };
  heavyLots?: {
    total: number;
    available: number;
  };
  heightLimitMeters: number; // e.g. 1.9, 2.0, 2.1, 4.5
  isSheltered: boolean;
  hasEPS: boolean; // Electronic Parking System
  evCharging?: EVChargerInfo;
  rates: ParkingRate;
  lastUpdated: string;
  source: 'live-api' | 'verified-cache';
}

export interface UserLocation {
  name: string;
  lat: number;
  lng: number;
  isCustom?: boolean;
}

export interface DestinationShortcut {
  name: string;
  category: 'Shopping' | 'Attraction' | 'Business' | 'Transport' | 'Dining';
  lat: number;
  lng: number;
  area: string;
}
