import React, { useState } from 'react';
import { UserLocation } from '../types/carpark';
import { USER_LOCATION_PRESETS } from '../data/singaporeCarparks';
import { Navigation, MapPin, Check } from 'lucide-react';

interface UserLocationSelectorProps {
  currentLocation: UserLocation;
  onLocationChange: (loc: UserLocation) => void;
}

export const UserLocationSelector: React.FC<UserLocationSelectorProps> = ({
  currentLocation,
  onLocationChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by your browser');
      return;
    }
    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onLocationChange({
          name: 'My Current Location (GPS)',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isCustom: true,
        });
        setIsOpen(false);
      },
      (err) => {
        setIsLocating(false);
        setGeoError(err.message || 'Unable to retrieve location');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 max-w-xs"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">Near: {currentLocation.name}</span>
        </button>

        <button
          onClick={handleUseGps}
          disabled={isLocating}
          title="Use Device GPS"
          className="p-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-900 transition-colors disabled:opacity-60"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-72 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-40">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Choose Location / Starting Point
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Calculates live driving distances and travel times
              </p>
            </div>

            <button
              onClick={handleUseGps}
              className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5" />
                <span>Use Device GPS Location</span>
              </span>
            </button>

            {geoError && (
              <p className="text-[11px] text-rose-500 px-2 py-1">{geoError}</p>
            )}

            <div className="pt-1 border-t border-slate-100 dark:border-slate-800 mt-1 max-h-56 overflow-y-auto">
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Singapore Hub Presets
              </span>
              {USER_LOCATION_PRESETS.map((preset) => {
                const isSelected = currentLocation.name === preset.name;
                return (
                  <button
                    key={preset.name}
                    onClick={() => {
                      onLocationChange(preset);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <span className="truncate">{preset.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
