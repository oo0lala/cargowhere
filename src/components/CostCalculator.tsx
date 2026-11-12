import React, { useState } from 'react';
import { Carpark } from '../types/carpark';
import { calculateParkingCost } from '../services/carparkApi';
import { Calculator, Clock, Calendar, Check, ExternalLink } from 'lucide-react';

interface CostCalculatorProps {
  carparks: Carpark[];
  onSelectCarpark: (carpark: Carpark) => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  carparks,
  onSelectCarpark,
}) => {
  const [selectedCarparkId, setSelectedCarparkId] = useState<string>(carparks[0]?.id || 'MBS01');
  const [durationHours, setDurationHours] = useState<number>(3);
  const [entryHour, setEntryHour] = useState<number>(14);
  const [dayType, setDayType] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');
  const [compareArea, setCompareArea] = useState<string>('Orchard');

  const selectedCp = carparks.find((c) => c.id === selectedCarparkId) || carparks[0];

  const primaryEstimate = selectedCp
    ? calculateParkingCost(selectedCp, entryHour, durationHours, dayType)
    : { cost: 0, breakdown: '' };

  // Comparison carparks in the same area
  const areaCarparks = carparks.filter((c) => c.area.includes(compareArea) || c.area === compareArea);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6 transition-colors">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Singapore Parking Rates Estimator
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Calculate and compare parking costs before driving out. Factor in peak hour surcharges,
          evening per-entry caps, and Sunday schemes.
        </p>
      </div>

      {/* Control Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Select Carpark
          </label>
          <select
            value={selectedCarparkId}
            onChange={(e) => setSelectedCarparkId(e.target.value)}
            className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            {carparks.map((cp) => (
              <option key={cp.id} value={cp.id}>
                {cp.name} ({cp.area})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Day of Week
          </label>
          <select
            value={dayType}
            onChange={(e) => setDayType(e.target.value as 'weekday' | 'saturday' | 'sunday')}
            className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="weekday">Weekday (Mon - Fri)</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday / Public Holiday</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Arrival Time
          </label>
          <select
            value={entryHour}
            onChange={(e) => setEntryHour(parseInt(e.target.value, 10))}
            className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value={7}>07:00 AM (Early Morning)</option>
            <option value={9}>09:00 AM (Peak Business)</option>
            <option value={12}>12:00 PM (Lunch)</option>
            <option value={14}>02:00 PM (Afternoon)</option>
            <option value={18}>06:00 PM (Evening Flat Rate)</option>
            <option value={20}>08:00 PM (Night Dinner)</option>
            <option value={23}>11:00 PM (Late Night)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Parking Duration
          </label>
          <select
            value={durationHours}
            onChange={(e) => setDurationHours(parseFloat(e.target.value))}
            className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value={0.5}>30 minutes</option>
            <option value={1}>1 hour</option>
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
            <option value={4}>4 hours</option>
            <option value={6}>6 hours</option>
            <option value={8}>8 hours (Full day)</option>
          </select>
        </div>
      </div>

      {/* Primary Result Card */}
      {selectedCp && (
        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                {selectedCp.name}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono">{selectedCp.agency}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {primaryEstimate.breakdown}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Estimated Total Cost
            </span>
            <span className="text-2xl font-black font-tabular text-emerald-600 dark:text-emerald-400">
              ${primaryEstimate.cost.toFixed(2)} SGD
            </span>
          </div>
        </div>
      )}

      {/* Comparison Matrix for the Area */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Compare with Nearby Carparks in {selectedCp?.area}
          </h3>
          <span className="text-xs text-slate-500">
            Duration: <strong className="font-tabular">{durationHours}h</strong>
          </span>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Carpark</th>
                <th className="py-2.5 px-3 font-semibold">Agency</th>
                <th className="py-2.5 px-3 font-semibold text-right">Available Lots</th>
                <th className="py-2.5 px-3 font-semibold text-right">Estimated Fee</th>
                <th className="py-2.5 px-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {areaCarparks.map((cp) => {
                const est = calculateParkingCost(cp, entryHour, durationHours, dayType);
                const isSelected = cp.id === selectedCarparkId;
                return (
                  <tr
                    key={cp.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                      {cp.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {cp.agency}
                    </td>
                    <td className="py-2.5 px-3 text-right font-tabular">
                      <span
                        className={`font-semibold ${
                          cp.carLots.available > 50
                            ? 'text-emerald-600'
                            : cp.carLots.available > 0
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {cp.carLots.available}
                      </span>{' '}
                      <span className="text-slate-400 text-[10px]">/ {cp.carLots.total}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-tabular text-slate-900 dark:text-white">
                      ${est.cost.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedCarparkId(cp.id);
                          onSelectCarpark(cp);
                        }}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
