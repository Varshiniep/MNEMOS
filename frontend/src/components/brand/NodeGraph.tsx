import { useEffect, useRef } from 'react';

interface NodeGraphProps {
  width?: number;
  height?: number;
  className?: string;
  animate?: boolean;
}

const NODES = [
  { id: 0, x: 160, y: 110, label: 'Hall',    r: 20, main: true  },
  { id: 1, x: 80,  y: 55,  label: 'Kitchen', r: 14, main: false },
  { id: 2, x: 240, y: 55,  label: 'Storage', r: 14, main: false },
  { id: 3, x: 55,  y: 145, label: 'door',    r: 10, main: false },
  { id: 4, x: 265, y: 155, label: 'chest',   r: 10, main: false },
  { id: 5, x: 160, y: 190, label: 'key',     r: 10, main: false },
];

const EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 3], [2, 4],
];

export function NodeGraph({ width = 320, height = 220, className = '', animate = true }: NodeGraphProps) {
  const scaleX = width / 320;
  const scaleY = height / 220;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ng-main" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#4f46e5" />
        </radialGradient>
        <radialGradient id="ng-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.7" />
        </radialGradient>
        <filter id="ng-glow">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {EDGES.map(([a, b], i) => {
        const na = NODES[a], nb = NODES[b];
        return (
          <line
            key={i}
            x1={na.x * scaleX} y1={na.y * scaleY}
            x2={nb.x * scaleX} y2={nb.y * scaleY}
            stroke="rgba(99,102,241,0.35)"
            strokeWidth="1.5"
          />
        );
      })}

      {/* Nodes */}
      {NODES.map(n => (
        <g key={n.id} style={animate ? { animation: `float ${2.5 + n.id * 0.3}s ease-in-out infinite` } : {}}>
          <circle
            cx={n.x * scaleX} cy={n.y * scaleY}
            r={n.r * Math.min(scaleX, scaleY)}
            fill={n.main ? 'url(#ng-main)' : 'url(#ng-node)'}
            filter={n.main ? 'url(#ng-glow)' : undefined}
            opacity={n.main ? 1 : 0.85}
          />
          {n.main && (
            <circle
              cx={n.x * scaleX} cy={n.y * scaleY}
              r={n.r * 0.45 * Math.min(scaleX, scaleY)}
              fill="white" opacity="0.9"
            />
          )}
          {height > 150 && (
            <text
              x={n.x * scaleX}
              y={(n.y + n.r + 10) * scaleY}
              textAnchor="middle"
              fontSize={9 * Math.min(scaleX, scaleY)}
              fill="rgba(148,163,184,0.8)"
            >
              {n.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
