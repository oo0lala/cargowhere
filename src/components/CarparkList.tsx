import React from 'react';
import { Carpark, UserLocation } from '../types/carpark';
import { calculateDistanceKm, calculateDriveTimeMins, getAvailabilityStatus } from '../services/carparkApi';
import {
  Navigation2,
  Zap,
  Bookmark,
  ChevronRight,
  ShieldAlert,
  Umbrella,
  Clock,
  Car,
  Bike,
  Truck,
} from 'lucide-react';

interface CarparkListProps {
  carparks: Carpark[];
  userLocation: UserLocation;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectCarpark: (carpark: Carpark) => void;
  selectedCarparkId?: string;
}

export const CarparkList: React.FC<CarparkListProps> = ({
  carparks,
  userLocation,
  favorites,
  onToggleFavorite,
  onSelectCarpark,
  selectedCarparkId,
}) => {
  if (carparks.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <Car className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No carparks matched your criteria
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Try clearing filters, searching for a different area, or adjusting vehicle type filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {carparks.map((cp) => {
        const distance = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          cp.coordinates.lat,
          cp.coordinates.lng
        );
        const driveMins = calculateDriveTimeMins(distance);
        const status = getAvailabilityStatus(cp.carLots.available, cp.carLots.total);
        const isFav = favorites.includes(cp.id);
        const isSelected = selectedCarparkId === cp.id;
        const availableRatio = Math.round((cp.carLots.available / cp.carLots.total) * 100);

        // Status colors
        const statusStyles = {
          plentiful: {
            bg: 'bg-emerald-500',
            badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            label: 'Lots Available',
          },
          moderate: {
            bg: 'bg-amber-500',
            badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            label: 'Filling Fast',
          },
          critical: {
            bg: 'bg-rose-500',
            badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
            label: 'Almost Full',
          },
          full: {
            bg: 'bg-slate-500',
            badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
            label: 'Full',
          },
        }[status];

        return (
          <div
            key={cp.id}
            onClick={() => onSelectCarpark(cp)}
            className={`group relative p-4 bg-white dark:bg-slate-900 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
              isSelected
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* Top Row: Area / Agency / Bookmark */}
            <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
                <span className="font-medium text-slate-700 dark:text-slate-300">{cp.area}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px] text-slate-400">{cp.agency}</span>
                {cp.isSheltered && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[11px] text-slate-400">Sheltered</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(cp.id);
                }}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                className="p-1 rounded-md text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              >
                <Bookmark
                  className={`w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`}
                />
              </button>
            </div>

            {/* Carpark Title */}
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {cp.name}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mb-3">
              {cp.address}
            </p>

            {/* Real-time Vacancy Gauge */}
            <div className="mb-3.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Car Lots</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${statusStyles.badgeBg}`}
                  >
                    {statusStyles.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-tabular text-slate-900 dark:text-white">
                    {cp.carLots.available}
                  </span>
                  <span className="text-[11px] text-slate-400 font-tabular"> / {cp.carLots.total}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${statusStyles.bg} transition-all duration-300`}
                  style={{ width: `${Math.min(100, Math.max(0, availableRatio))}%` }}
                />
              </div>

              {/* Multi-lot Breakdown (Bikes & Heavy if available) */}
              {(cp.motorcycleLots || cp.heavyLots) && (
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 font-tabular">
                  {cp.motorcycleLots && (
                    <span className="flex items-center gap-1">
                      <Bike className="w-3 h-3 text-slate-400" />
                      <span>{cp.motorcycleLots.available} bike lots</span>
                    </span>
                  )}
                  {cp.heavyLots && (
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-slate-400" />
                      <span>{cp.heavyLots.available} heavy</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Key Stats Row */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                <Navigation2 className="w-3.5 h-3.5" />
                <span className="font-tabular">{distance} km</span>
                <span className="text-slate-400">·</span>
                <span className="font-tabular">~{driveMins} mins</span>
              </div>

              <div className="flex items-center gap-2">
                {cp.evCharging && (
                  <span
                    className="flex items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium"
                    title={`${cp.evCharging.count}x ${cp.evCharging.operator} (${cp.evCharging.speed})`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>{cp.evCharging.count} EV</span>
                  </span>
                )}
                <span className="font-tabular font-semibold text-slate-900 dark:text-white">
                  ${cp.rates.perHourEstimate.toFixed(2)}/hr
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
