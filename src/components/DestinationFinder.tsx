import React, { useState } from 'react';
import { Carpark, DestinationShortcut } from '../types/carpark';
import { POPULAR_DESTINATIONS } from '../data/singaporeCarparks';
import { calculateDistanceKm, calculateDriveTimeMins, getAvailabilityStatus } from '../services/carparkApi';
import { Search, Compass, MapPin, Zap, ChevronRight, CheckCircle2, Car } from 'lucide-react';

interface DestinationFinderProps {
  carparks: Carpark[];
  onSelectCarpark: (carpark: Carpark) => void;
}

export const DestinationFinder: React.FC<DestinationFinderProps> = ({
  carparks,
  onSelectCarpark,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<DestinationShortcut>(
    POPULAR_DESTINATIONS[0]
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories = ['ALL', 'Shopping', 'Attraction', 'Dining', 'Business'];

  const filteredDestinations = POPULAR_DESTINATIONS.filter(
    (d) => categoryFilter === 'ALL' || d.category === categoryFilter
  );

  // Compute nearby carparks sorted by proximity and lot availability
  const nearbyCarparks = React.useMemo(() => {
    return carparks
      .map((cp) => {
        const dist = calculateDistanceKm(
          selectedDestination.lat,
          selectedDestination.lng,
          cp.coordinates.lat,
          cp.coordinates.lng
        );
        return { ...cp, destDistance: dist };
      })
      .filter((cp) => cp.destDistance <= 4.0) // within 4 km
      .sort((a, b) => {
        // Balance distance and available lots
        const scoreA = a.destDistance * 2 - (a.carLots.available > 50 ? 2 : 0);
        const scoreB = b.destDistance * 2 - (b.carLots.available > 50 ? 2 : 0);
        return scoreA - scoreB;
      })
      .slice(0, 5);
  }, [carparks, selectedDestination]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6 transition-colors">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Destination Parking Assistant
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select where you are going in Singapore to see the best nearby carparks ranked by vacancy,
          distance, and hourly rates.
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              categoryFilter === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Destination Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {filteredDestinations.map((dest) => {
          const isSelected = selectedDestination.name === dest.name;
          return (
            <button
              key={dest.name}
              onClick={() => setSelectedDestination(dest)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {dest.category}
                </span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {dest.name}
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{dest.area}</span>
            </button>
          );
        })}
      </div>

      {/* Ranked Parking Options for Selected Destination */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Top Recommended Carparks near {selectedDestination.name}
          </h3>
          <span className="text-xs text-slate-500 font-tabular">
            {nearbyCarparks.length} options found
          </span>
        </div>

        <div className="space-y-2.5">
          {nearbyCarparks.map((cp, idx) => {
            const status = getAvailabilityStatus(cp.carLots.available, cp.carLots.total);
            const walkMins = Math.round(cp.destDistance * 12); // ~12 mins per km walking
            const isFull = cp.carLots.available === 0;

            const badgeColor = {
              plentiful: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
              moderate: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
              critical: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40',
              full: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
            }[status];

            return (
              <div
                key={cp.id}
                onClick={() => onSelectCarpark(cp)}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {cp.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {cp.agency}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-tabular text-slate-700 dark:text-slate-300 font-medium">
                        {cp.destDistance} km away
                      </span>
                      <span>·</span>
                      <span className="font-tabular">~{walkMins} min walk</span>
                      <span>·</span>
                      <span className="font-tabular font-medium text-slate-700 dark:text-slate-300">
                        ~${cp.rates.perHourEstimate.toFixed(2)}/hr
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-tabular ${badgeColor}`}
                    >
                      {isFull ? 'FULL' : `${cp.carLots.available} Vacant`}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-tabular">
                      / {cp.carLots.total} total
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
