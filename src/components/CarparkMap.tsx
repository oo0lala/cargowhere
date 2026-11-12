import React, { useState, useRef, useMemo } from 'react';
import { Carpark, UserLocation } from '../types/carpark';
import { calculateDistanceKm, calculateDriveTimeMins, getAvailabilityStatus } from '../services/carparkApi';
import { ZoomIn, ZoomOut, RotateCcw, Navigation2, Zap, ShieldAlert, Car, MapPin } from 'lucide-react';

interface CarparkMapProps {
  carparks: Carpark[];
  userLocation: UserLocation;
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  selectedArea: string;
}

// Singapore coordinate bounds for projection
const SG_BOUNDS = {
  minLat: 1.230,
  maxLat: 1.470,
  minLng: 103.600,
  maxLng: 104.040,
};

// SVG viewBox dimensions
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 580;

function projectToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - SG_BOUNDS.minLng) / (SG_BOUNDS.maxLng - SG_BOUNDS.minLng)) * MAP_WIDTH;
  // Latitudes increase northward, but SVG y increases downward
  const y = MAP_HEIGHT - ((lat - SG_BOUNDS.minLat) / (SG_BOUNDS.maxLat - SG_BOUNDS.minLat)) * MAP_HEIGHT;
  return { x, y };
}

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  userLocation,
  selectedCarpark,
  onSelectCarpark,
  selectedArea,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [hoveredCarpark, setHoveredCarpark] = useState<Carpark | null>(null);

  const userPoint = useMemo(
    () => projectToSvg(userLocation.lat, userLocation.lng),
    [userLocation.lat, userLocation.lng]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setZoom((z) => Math.min(3.5, z + 0.35));
  const handleZoomOut = () => setZoom((z) => Math.max(0.85, z - 0.35));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const centerOnCarpark = (cp: Carpark) => {
    const pt = projectToSvg(cp.coordinates.lat, cp.coordinates.lng);
    setZoom(1.8);
    setPan({
      x: MAP_WIDTH / 2 - pt.x * 1.8,
      y: MAP_HEIGHT / 2 - pt.y * 1.8,
    });
    onSelectCarpark(cp);
  };

  // Status color mapper
  const getPinColor = (cp: Carpark) => {
    const status = getAvailabilityStatus(cp.carLots.available, cp.carLots.total);
    if (status === 'plentiful') return { bg: '#10B981', ring: 'rgba(16, 185, 129, 0.3)', text: 'text-emerald-400' };
    if (status === 'moderate') return { bg: '#F59E0B', ring: 'rgba(245, 158, 11, 0.3)', text: 'text-amber-400' };
    if (status === 'critical') return { bg: '#EF4444', ring: 'rgba(239, 68, 68, 0.3)', text: 'text-rose-400' };
    return { bg: '#6B7280', ring: 'rgba(107, 114, 128, 0.3)', text: 'text-slate-400' };
  };

  return (
    <div className="relative w-full h-[520px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 select-none">
      {/* Map Header Status & Quick Area Jump */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700/80 text-xs text-slate-300 flex items-center gap-2 shadow-lg">
          <span className="font-semibold text-slate-100">Live Singapore GIS Grid</span>
          <span className="text-slate-500">·</span>
          <span className="font-tabular text-slate-400">{carparks.length} monitored hubs</span>
        </div>
      </div>

      {/* Map Navigation Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom in"
          className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shadow-md transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
          className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shadow-md transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          title="Reset View"
          aria-label="Reset map"
          className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shadow-md transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Map Canvas */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {/* Graticule / Geo coordinate grid lines */}
          <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" strokeDasharray="3 3">
            <line x1="0" y1="120" x2={MAP_WIDTH} y2="120" />
            <line x1="0" y1="240" x2={MAP_WIDTH} y2="240" />
            <line x1="0" y1="360" x2={MAP_WIDTH} y2="360" />
            <line x1="0" y1="480" x2={MAP_WIDTH} y2="480" />
            <line x1="200" y1="0" x2="200" y2={MAP_HEIGHT} />
            <line x1="400" y1="0" x2="400" y2={MAP_HEIGHT} />
            <line x1="600" y1="0" x2="600" y2={MAP_HEIGHT} />
            <line x1="800" y1="0" x2="800" y2={MAP_HEIGHT} />
          </g>

          {/* Johor / Malaysia Straits boundary hint (North) */}
          <path
            d="M 50,15 Q 350,10 650,25 T 950,5"
            fill="none"
            stroke="rgba(148, 163, 184, 0.18)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text x="500" y="28" fill="#475569" fontSize="11" textAnchor="middle" letterSpacing="2">
            STRAITS OF JOHOR
          </text>

          {/* Singapore Main Island Silhouette */}
          <path
            d={`
              M 110,320
              C 120,290 145,260 180,240
              C 210,225 240,210 280,180
              C 310,160 360,140 420,135
              C 480,130 540,128 600,132
              C 640,135 700,148 760,170
              C 810,188 870,220 920,270
              C 940,290 950,320 930,340
              C 900,370 850,380 780,395
              C 710,410 650,420 590,430
              C 530,440 480,455 420,460
              C 370,465 310,450 250,440
              C 200,430 150,410 130,380
              Z
            `}
            fill="#1E293B"
            stroke="#334155"
            strokeWidth="2"
            className="filter drop-shadow-md"
          />

          {/* Jurong Island & Industrial Archipelago */}
          <path
            d="M 170,440 C 190,435 240,445 230,470 C 220,490 180,485 160,470 Z"
            fill="#1E293B"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Sentosa Island */}
          <path
            d="M 460,495 C 490,485 540,488 535,505 C 530,520 480,520 460,510 Z"
            fill="#1E293B"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Pulau Ubin & Pulau Tekong */}
          <path
            d="M 780,140 C 810,135 840,140 835,155 C 830,165 790,165 775,150 Z"
            fill="#1E293B"
            stroke="#334155"
            strokeWidth="1"
          />
          <path
            d="M 870,140 C 900,130 930,135 925,160 C 920,180 880,175 865,155 Z"
            fill="#1E293B"
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Expressways (PIE, CTE, AYE, ECP, KPE) */}
          <g stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6">
            {/* PIE - Pan Island Expressway (Tuas to Changi) */}
            <path d="M 180,310 Q 350,280 500,285 T 890,290" />
            {/* AYE - Ayer Rajah Expressway */}
            <path d="M 190,390 Q 320,380 470,440" />
            {/* CTE - Central Expressway (Ang Mo Kio down to CBD) */}
            <path d="M 520,170 Q 515,280 525,450" />
            {/* ECP - East Coast Parkway (CBD to Changi) */}
            <path d="M 540,450 Q 700,430 890,310" />
            {/* SLE / BKE - Seletar / Bukit Timah */}
            <path d="M 370,160 Q 400,240 450,330" />
            {/* KPE - Kallang Paya Lebar */}
            <path d="M 610,210 Q 600,320 570,440" />
          </g>

          {/* Expressway Names subtle labels */}
          <g fill="#64748B" fontSize="9" fontWeight="600" letterSpacing="0.5">
            <text x="320" y="275">PIE</text>
            <text x="730" y="305">PIE</text>
            <text x="270" y="380">AYE</text>
            <text x="500" y="225">CTE</text>
            <text x="740" y="420">ECP</text>
            <text x="490" y="515">SENTOSA</text>
            <text x="900" y="305">CHANGI</text>
          </g>

          {/* User Location Radar Pulse */}
          <g transform={`translate(${userPoint.x}, ${userPoint.y})`}>
            <circle r="16" fill="rgba(59, 130, 246, 0.2)" className="animate-ping" />
            <circle r="8" fill="rgba(59, 130, 246, 0.4)" />
            <circle r="4" fill="#3B82F6" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* Carpark Pins */}
          {carparks.map((cp) => {
            const pt = projectToSvg(cp.coordinates.lat, cp.coordinates.lng);
            const isSelected = selectedCarpark?.id === cp.id;
            const isHovered = hoveredCarpark?.id === cp.id;
            const { bg, ring } = getPinColor(cp);
            const isFull = cp.carLots.available === 0;

            return (
              <g
                key={cp.id}
                transform={`translate(${pt.x}, ${pt.y})`}
                className="cursor-pointer transition-all duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  centerOnCarpark(cp);
                }}
                onMouseEnter={() => setHoveredCarpark(cp)}
                onMouseLeave={() => setHoveredCarpark(null)}
              >
                {/* Active selection pulse ring */}
                {isSelected && (
                  <circle
                    r="20"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ animationDuration: '6s' }}
                  />
                )}

                {/* Pin outer halo */}
                <circle
                  r={isSelected ? 14 : isHovered ? 12 : 9}
                  fill={ring}
                  className="transition-all"
                />

                {/* Pin central core */}
                <circle
                  r={isSelected ? 8 : isHovered ? 7 : 5.5}
                  fill={bg}
                  stroke="#0F172A"
                  strokeWidth="1.5"
                  className="transition-all"
                />

                {/* Available lots counter label if lots > 0 and zoomed in */}
                {zoom >= 1.2 && (
                  <text
                    y={-12}
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="JetBrains Mono, monospace"
                    className="pointer-events-none drop-shadow-md select-none"
                  >
                    {isFull ? 'FULL' : cp.carLots.available}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Inspector Preview Card for Hovered or Selected Carpark */}
      {(hoveredCarpark || selectedCarpark) && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm z-30 pointer-events-auto">
          {(() => {
            const cp = hoveredCarpark || selectedCarpark!;
            const distance = calculateDistanceKm(
              userLocation.lat,
              userLocation.lng,
              cp.coordinates.lat,
              cp.coordinates.lng
            );
            const driveMins = calculateDriveTimeMins(distance);
            const status = getAvailabilityStatus(cp.carLots.available, cp.carLots.total);
            const { bg, text } = getPinColor(cp);
            const isFull = cp.carLots.available === 0;

            return (
              <div
                onClick={() => onSelectCarpark(cp)}
                className="p-3.5 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl cursor-pointer hover:border-slate-500 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-medium text-slate-400 truncate">{cp.area}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[11px] font-medium text-slate-400">{cp.agency}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 truncate">{cp.name}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: bg }}
                      />
                      <span className={`text-xs font-bold font-tabular ${text}`}>
                        {isFull ? 'FULL' : `${cp.carLots.available} LOTS`}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-tabular">
                      of {cp.carLots.total} total
                    </span>
                  </div>
                </div>

                {/* Key Quick Metadata */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-300">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Navigation2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-tabular font-medium text-slate-200">{distance} km</span>
                    <span className="text-slate-500">·</span>
                    <span className="font-tabular text-slate-300">~{driveMins} mins</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {cp.evCharging && (
                      <span className="flex items-center gap-0.5 text-[11px] text-emerald-400" title="EV Charging available">
                        <Zap className="w-3 h-3" />
                        <span>EV</span>
                      </span>
                    )}
                    <span className="font-tabular text-[11px] text-slate-300 font-medium">
                      ~${cp.rates.perHourEstimate.toFixed(2)}/hr
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-800 text-[11px] text-slate-300 shadow-lg pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>&gt;30% (Plenty)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>10-30% (Moderate)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>&lt;10% (Low)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-500" />
          <span>Full</span>
        </div>
      </div>
    </div>
  );
};
