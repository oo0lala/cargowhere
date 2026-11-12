import React, { useState } from 'react';
import { Carpark, UserLocation } from '../types/carpark';
import { calculateDistanceKm, calculateDriveTimeMins, calculateParkingCost, getAvailabilityStatus } from '../services/carparkApi';
import {
  X,
  Navigation,
  Compass,
  Bookmark,
  Zap,
  Car,
  Bike,
  Truck,
  ShieldAlert,
  Umbrella,
  Clock,
  Calculator,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  userLocation: UserLocation;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  onClose,
  userLocation,
  isFavorite,
  onToggleFavorite,
}) => {
  const [calcDuration, setCalcDuration] = useState<number>(2);
  const [calcDayType, setCalcDayType] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');
  const [calcEntryHour, setCalcEntryHour] = useState<number>(14);

  if (!carpark) return null;

  const distance = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    carpark.coordinates.lat,
    carpark.coordinates.lng
  );
  const driveMins = calculateDriveTimeMins(distance);
  const status = getAvailabilityStatus(carpark.carLots.available, carpark.carLots.total);
  const occupancyPercent = Math.round(
    ((carpark.carLots.total - carpark.carLots.available) / carpark.carLots.total) * 100
  );

  const estimatedFee = calculateParkingCost(carpark, calcEntryHour, calcDuration, calcDayType);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${carpark.coordinates.lat},${carpark.coordinates.lng}&navigate=yes`;

  // Status badge styling
  const statusConfig = {
    plentiful: {
      text: 'Ample Vacancy',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    },
    moderate: {
      text: 'Moderate Demand',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    },
    critical: {
      text: 'Critical / Almost Full',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    },
    full: {
      text: 'Carpark Full',
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    },
  }[status];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 transition-colors my-8">
        {/* Modal Top Bar */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {carpark.area}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
                {carpark.agency}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-400">ID: {carpark.id}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {carpark.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {carpark.address}, Singapore {carpark.postalCode}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-3">
            <button
              onClick={() => onToggleFavorite(carpark.id)}
              className="p-2 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isFavorite ? 'Remove bookmark' : 'Bookmark this carpark'}
            >
              <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Real-time Vacancy Hero Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Real-time Availability
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold font-tabular text-slate-900 dark:text-white">
                    {carpark.carLots.available}
                  </span>
                  <span className="text-sm font-medium font-tabular text-slate-500 dark:text-slate-400">
                    lots available out of {carpark.carLots.total}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.color}`}>
                  {statusConfig.text}
                </span>
              </div>
            </div>

            {/* Visual Occupancy Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-tabular">
                <span>Occupancy: {occupancyPercent}%</span>
                <span>{carpark.carLots.total - carpark.carLots.available} occupied</span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.round((carpark.carLots.available / carpark.carLots.total) * 100)}%` }}
                />
              </div>
            </div>

            {/* Other Lots Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-xs">
                <Car className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Car Lots</span>
                  <span className="font-semibold font-tabular text-slate-800 dark:text-slate-200">
                    {carpark.carLots.available} / {carpark.carLots.total}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Bike className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Motorcycle Lots</span>
                  <span className="font-semibold font-tabular text-slate-800 dark:text-slate-200">
                    {carpark.motorcycleLots ? `${carpark.motorcycleLots.available} / ${carpark.motorcycleLots.total}` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Truck className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Heavy Vehicles</span>
                  <span className="font-semibold font-tabular text-slate-800 dark:text-slate-200">
                    {carpark.heavyLots ? `${carpark.heavyLots.available} / ${carpark.heavyLots.total}` : 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* EV Charging & Clearance Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Height Clearance */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Height Limit: {carpark.heightLimitMeters.toFixed(2)}m
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {carpark.heightLimitMeters < 2.0
                    ? 'Strict limit. Check high-roof vans or SUVs with roof boxes.'
                    : 'Standard clearance for passenger cars and SUVs.'}
                </p>
              </div>
            </div>

            {/* EV Chargers */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <Zap className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {carpark.evCharging ? `${carpark.evCharging.count}x EV Charging Points` : 'No EV Chargers'}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {carpark.evCharging
                    ? `Operated by ${carpark.evCharging.operator} · ${carpark.evCharging.speed}`
                    : 'No public EV charging infrastructure recorded here.'}
                </p>
              </div>
            </div>
          </div>

          {/* Official Rates Schedule Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Official Parking Rates
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="py-2.5 px-3.5 font-medium text-slate-600 dark:text-slate-300 w-1/3">
                      Weekday Daytime
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200 font-tabular">
                      {carpark.rates.weekdayDay}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5 font-medium text-slate-600 dark:text-slate-300">
                      Weekday Evening / Night
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200 font-tabular">
                      {carpark.rates.weekdayNight}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="py-2.5 px-3.5 font-medium text-slate-600 dark:text-slate-300">
                      Saturdays
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200 font-tabular">
                      {carpark.rates.saturday}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5 font-medium text-slate-600 dark:text-slate-300">
                      Sundays &amp; Public Holidays
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200 font-tabular">
                      {carpark.rates.sundayPH}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="py-2.5 px-3.5 font-medium text-slate-600 dark:text-slate-300">
                      Grace Period
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200 font-tabular">
                      {carpark.rates.gracePeriodMins} minutes free for pickup / dropoff
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Parking Cost Estimator for this spot */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Estimate Fee for this Carpark
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Day of Week
                </label>
                <select
                  value={calcDayType}
                  onChange={(e) => setCalcDayType(e.target.value as 'weekday' | 'saturday' | 'sunday')}
                  className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="weekday">Weekday (Mon-Fri)</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday / Holiday</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Entry Time
                </label>
                <select
                  value={calcEntryHour}
                  onChange={(e) => setCalcEntryHour(parseInt(e.target.value, 10))}
                  className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value={8}>08:00 AM (Morning)</option>
                  <option value={12}>12:00 PM (Lunch)</option>
                  <option value={14}>02:00 PM (Afternoon)</option>
                  <option value={18}>06:00 PM (Evening)</option>
                  <option value={20}>08:00 PM (Night)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Duration
                </label>
                <select
                  value={calcDuration}
                  onChange={(e) => setCalcDuration(parseFloat(e.target.value))}
                  className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value={0.15}>10 mins (Grace Period)</option>
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours</option>
                  <option value={6}>6 Hours</option>
                  <option value={8}>Full Day (8 Hours)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {estimatedFee.breakdown}
              </span>
              <span className="text-base font-bold font-tabular text-emerald-600 dark:text-emerald-400">
                ~${estimatedFee.cost.toFixed(2)} SGD
              </span>
            </div>
          </div>
        </div>

        {/* Footer Navigation CTA */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Distance: </span>
            <strong className="text-slate-800 dark:text-slate-200 font-tabular">{distance} km</strong>
            <span> · Drive: </span>
            <strong className="text-slate-800 dark:text-slate-200 font-tabular">~{driveMins} mins</strong>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Waze</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
