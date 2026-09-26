import React, { useState } from 'react';

export interface ChartDataPoint {
  label: string; // e.g. "Match 1", "Sep 20", "Day 1"
  value: number; // e.g. 4, 12, 45
  subtext?: string;
}

interface Props {
  title: string;
  subtitle: string;
  data: ChartDataPoint[];
  colorTheme?: 'blue' | 'red' | 'green' | 'amber';
  yAxisLabel?: string;
  defaultChartType?: 'line' | 'bar';
  invertRank?: boolean; // For position where #1 is highest
}

export const InsightsChart: React.FC<Props> = ({
  title,
  subtitle,
  data,
  colorTheme = 'red',
  yAxisLabel = 'Kills',
  defaultChartType = 'line',
  invertRank = false,
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>(defaultChartType);

  // Themes tuned for matte black dark background
  const themes = {
    red: {
      line: '#EF4444',
      dot: '#F87171',
      gradientFrom: '#EF4444',
      gradientTo: '#991B1B',
      bar: 'fill-red-500',
      activePill: 'bg-red-600 text-white',
      badge: 'text-red-400',
    },
    blue: {
      line: '#EF4444',
      dot: '#F87171',
      gradientFrom: '#EF4444',
      gradientTo: '#991B1B',
      bar: 'fill-red-500',
      activePill: 'bg-red-600 text-white',
      badge: 'text-red-400',
    },
    green: {
      line: '#10B981',
      dot: '#34D399',
      gradientFrom: '#10B981',
      gradientTo: '#064E3B',
      bar: 'fill-emerald-500',
      activePill: 'bg-emerald-600 text-white',
      badge: 'text-emerald-400',
    },
    amber: {
      line: '#F59E0B',
      dot: '#FBBF24',
      gradientFrom: '#F59E0B',
      gradientTo: '#78350F',
      bar: 'fill-amber-500',
      activePill: 'bg-amber-600 text-white',
      badge: 'text-amber-400',
    },
  };

  const theme = themes[colorTheme] || themes.red;

  // Chart dimensions
  const width = 340;
  const height = 135;
  const paddingLeft = 32;
  const paddingRight = 18;
  const paddingTop = 24;
  const paddingBottom = 24;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const pointsCount = data.length;

  if (pointsCount === 0) {
    return (
      <div className="bg-[#141419] rounded-2xl p-4 border border-[#22222b] shadow-sm mb-3.5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">{title}</h3>
            <p className="text-[11px] text-zinc-400 font-medium">{subtitle}</p>
          </div>
        </div>
        <div className="h-28 flex flex-col items-center justify-center text-zinc-400 text-xs">
          <p className="font-bold text-zinc-300">No match data recorded yet</p>
          <span className="text-[11px] text-zinc-500 mt-0.5">Play matches to see performance curve</span>
        </div>
      </div>
    );
  }

  // Calculate Y min and max
  const values = data.map((d) => d.value);
  let rawMin = Math.min(...values);
  let rawMax = Math.max(...values);

  if (rawMin === rawMax) {
    rawMax = rawMax + 5;
    rawMin = Math.max(0, rawMin - 1);
  }

  const yMin = invertRank ? rawMax + 1 : 0;
  const yMax = invertRank ? Math.max(1, rawMin - 1) : Math.max(10, Math.ceil(rawMax * 1.15));

  const getY = (val: number) => {
    if (invertRank) {
      // lower rank number = visually higher up
      const ratio = (val - yMax) / (yMin - yMax || 1);
      return paddingTop + ratio * chartHeight;
    }
    const ratio = (val - yMin) / (yMax - yMin || 1);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const getX = (idx: number) => {
    if (pointsCount <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (idx / (pointsCount - 1)) * chartWidth;
  };

  // Build SVG path
  const linePoints = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
  const pathD = linePoints.length > 0 ? `M ${linePoints.join(' L ')}` : '';
  const areaD = linePoints.length > 0
    ? `M ${linePoints.join(' L ')} L ${getX(pointsCount - 1)},${height - paddingBottom} L ${getX(0)},${height - paddingBottom} Z`
    : '';

  // Y-axis ticks
  const yTicks = invertRank
    ? [1, Math.round((rawMax + 1) / 2), Math.max(12, rawMax)]
    : [0, Math.round(yMax / 2), yMax];

  const gradId = `grad-${colorTheme}-${Math.random().toString(36).substr(2, 6)}`;

  return (
    <div className="bg-[#141419] rounded-2xl p-3.5 border border-[#22222b] shadow-sm mb-3 text-left transition-all">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="text-sm font-black text-white tracking-tight leading-tight">
            {title}
          </h3>
          <p className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Line / Bar Pill Switcher */}
        <div className="flex items-center bg-[#1c1c24] rounded-full p-0.5 border border-white/10 flex-shrink-0">
          <button
            type="button"
            onClick={() => setChartType('line')}
            className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full transition-all ${
              chartType === 'line' ? 'bg-red-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Line
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full transition-all ${
              chartType === 'bar' ? 'bg-red-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Bar
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden">
        {/* Y Axis Label */}
        <div className="absolute top-0 left-0 text-[8.5px] font-extrabold text-zinc-500 uppercase tracking-wider">
          {yAxisLabel}
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.gradientFrom} stopOpacity="0.4" />
              <stop offset="100%" stopColor={theme.gradientTo} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {yTicks.map((tickVal, i) => {
            const yPos = getY(tickVal);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={width - paddingRight}
                  y2={yPos}
                  stroke="#22222b"
                  strokeWidth="1"
                  strokeDasharray="2,3"
                />
                <text
                  x={paddingLeft - 6}
                  y={yPos + 3}
                  textAnchor="end"
                  fill="#71717a"
                  fontSize="8.5"
                  fontWeight="700"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Render Line or Bar Chart */}
          {chartType === 'line' ? (
            <>
              {/* Gradient Area Fill */}
              <path d={areaD} fill={`url(#${gradId})`} />

              {/* Smooth Trend Line */}
              <path
                d={pathD}
                fill="none"
                stroke={theme.line}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Point Dots & Floating Value Labels */}
              {data.map((d, i) => {
                const cx = getX(i);
                const cy = getY(d.value);
                return (
                  <g key={i}>
                    {/* Glowing outer circle */}
                    <circle cx={cx} cy={cy} r="5" fill="#141419" stroke={theme.dot} strokeWidth="2.5" />
                    {/* Inner core */}
                    <circle cx={cx} cy={cy} r="2" fill={theme.dot} />

                    {/* Numeric Value Label directly above node */}
                    <text
                      x={cx}
                      y={cy - 7}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontWeight="900"
                    >
                      {invertRank ? `#${d.value}` : d.value}
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            /* Bar Chart View */
            <g>
              {data.map((d, i) => {
                const cx = getX(i);
                const cy = getY(d.value);
                const barWidth = Math.min(22, Math.max(12, (chartWidth / pointsCount) * 0.55));
                const barHeight = Math.max(4, height - paddingBottom - cy);

                return (
                  <g key={i}>
                    <rect
                      x={cx - barWidth / 2}
                      y={cy}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill={theme.line}
                      opacity="0.9"
                    />
                    <text
                      x={cx}
                      y={cy - 6}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontWeight="900"
                    >
                      {invertRank ? `#${d.value}` : d.value}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* X Axis Labels */}
          {data.map((d, i) => {
            const cx = getX(i);
            return (
              <text
                key={i}
                x={cx}
                y={height - 7}
                textAnchor="middle"
                fill="#a1a1aa"
                fontSize="9"
                fontWeight="700"
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
