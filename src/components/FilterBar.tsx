import React from 'react';
import { Search, SlidersHorizontal, Car, Bike, Truck, Zap, Umbrella, ArrowDownUp, X } from 'lucide-react';
import { LotType } from '../types/carpark';

export interface FilterState {
  searchQuery: string;
  selectedArea: string;
  lotType: LotType | 'ALL';
  evOnly: boolean;
  shelteredOnly: boolean;
  maxHourlyRate: number | null;
  minLotsAvailable: number;
  sortBy: 'distance' | 'available' | 'cheapest' | 'name';
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  areas: string[];
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  areas,
  totalCount,
  filteredCount,
}) => {
  const update = (partial: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...partial });
  };

  const hasActiveFilters =
    filters.lotType !== 'ALL' ||
    filters.evOnly ||
    filters.shelteredOnly ||
    filters.maxHourlyRate !== null ||
    filters.minLotsAvailable > 0 ||
    filters.selectedArea !== 'ALL' ||
    filters.searchQuery.trim().length > 0;

  const resetFilters = () => {
    onFilterChange({
      searchQuery: '',
      selectedArea: 'ALL',
      lotType: 'ALL',
      evOnly: false,
      shelteredOnly: false,
      maxHourlyRate: null,
      minLotsAvailable: 0,
      sortBy: 'distance',
    });
  };

  return (
    <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Top Search + Sort Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => update({ searchQuery: e.target.value })}
            placeholder="Search carpark name, address, or postal code (e.g., Takashimaya, 018956)..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => update({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ArrowDownUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort by:</span>
          </div>
          <select
            value={filters.sortBy}
            onChange={(e) => update({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="distance">Nearest to me</option>
            <option value="available">Most lots available</option>
            <option value="cheapest">Cheapest hourly rate</option>
            <option value="name">Carpark name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Area Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5 scrollbar-none text-xs">
        <button
          onClick={() => update({ selectedArea: 'ALL' })}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filters.selectedArea === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Singapore
        </button>
        {areas.map((area) => (
          <button
            key={area}
            onClick={() => update({ selectedArea: area })}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filters.selectedArea === area
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Second Row: Vehicle Types & Feature Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Vehicle type segments */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => update({ lotType: 'ALL' })}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filters.lotType === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => update({ lotType: 'C' })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filters.lotType === 'C'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Car className="w-3 h-3" />
              <span>Cars</span>
            </button>
            <button
              onClick={() => update({ lotType: 'Y' })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filters.lotType === 'Y'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Bike className="w-3 h-3" />
              <span>Bikes</span>
            </button>
            <button
              onClick={() => update({ lotType: 'H' })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filters.lotType === 'H'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Truck className="w-3 h-3" />
              <span>Heavy</span>
            </button>
          </div>

          {/* Quick toggle chips */}
          <button
            onClick={() => update({ evOnly: !filters.evOnly })}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filters.evOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>EV Charging</span>
          </button>

          <button
            onClick={() => update({ shelteredOnly: !filters.shelteredOnly })}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filters.shelteredOnly
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Umbrella className="w-3 h-3" />
            <span>Sheltered</span>
          </button>

          <button
            onClick={() => update({ maxHourlyRate: filters.maxHourlyRate === 3 ? null : 3 })}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filters.maxHourlyRate === 3
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            Under $3/hr
          </button>
        </div>

        {/* Count summary and reset */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="font-tabular text-slate-800 dark:text-slate-200">{filteredCount}</strong> of{' '}
            <span className="font-tabular">{totalCount}</span>
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
