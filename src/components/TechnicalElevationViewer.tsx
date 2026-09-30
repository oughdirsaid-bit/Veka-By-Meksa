import React from 'react';
import { OpeningConfiguration, WindowType } from '../types';

interface TechnicalElevationViewerProps {
  largeurMm: number;
  hauteurMm: number;
  configuration: OpeningConfiguration;
  type: WindowType;
  couleur: string;
  className?: string;
  showDimensions?: boolean;
  repere?: string;
}

export const TechnicalElevationViewer: React.FC<TechnicalElevationViewerProps> = ({
  largeurMm = 1200,
  hauteurMm = 1450,
  configuration = '1_vantail_OF',
  type = 'Fenêtre',
  couleur = 'Blanc RAL 9016',
  className = '',
  showDimensions = true,
  repere
}) => {
  // SVG canvas bounds
  const paddingX = showDimensions ? 70 : 20;
  const paddingY = showDimensions ? 60 : 20;

  // Normalized aspect ratio scaling
  const maxViewDim = 320;
  const scale = Math.min(maxViewDim / Math.max(largeurMm, 1), maxViewDim / Math.max(hauteurMm, 1));
  const svgWidth = largeurMm * scale;
  const svgHeight = hauteurMm * scale;

  const totalSvgWidth = svgWidth + paddingX * 2;
  const totalSvgHeight = svgHeight + paddingY * 2;

  // Profile dimensions scaled
  const frameThickness = Math.max(10, Math.min(22, 70 * scale));
  const sashThickness = Math.max(8, Math.min(18, 65 * scale));

  // Frame color styles
  const isAnthracite = couleur.toLowerCase().includes('7016') || couleur.toLowerCase().includes('anthracite');
  const isCheneDore = couleur.toLowerCase().includes('chêne') || couleur.toLowerCase().includes('chene') || couleur.toLowerCase().includes('bois');

  const frameFill = isAnthracite
    ? '#334155'
    : isCheneDore
    ? '#854d0e'
    : '#f8fafc';

  const frameStroke = isAnthracite
    ? '#1e293b'
    : isCheneDore
    ? '#58310c'
    : '#cbd5e1';

  const sashFill = isAnthracite
    ? '#475569'
    : isCheneDore
    ? '#9a3412'
    : '#f1f5f9';

  // Sashes logic
  const isFixe = configuration === 'fixe' || type === 'Fixe';
  const is2V = configuration === '2_vantaux_OF' || configuration === '2_vantaux_OB_OF';
  const is3V = configuration === '3_vantaux' || configuration === 'coulissant_3V';
  const isCoulissant = configuration === 'coulissant_2V' || configuration === 'coulissant_3V' || type === 'Baie coulissante' || type === 'Coulissant';

  const sashCount = isFixe ? 0 : is3V ? 3 : is2V ? 2 : 1;
  const innerFrameX = paddingX + frameThickness;
  const innerFrameY = paddingY + frameThickness;
  const innerFrameW = Math.max(10, svgWidth - frameThickness * 2);
  const innerFrameH = Math.max(10, svgHeight - frameThickness * 2);

  const sashWidth = sashCount > 0 ? (innerFrameW - (sashCount - 1) * (frameThickness * 0.4)) / sashCount : innerFrameW;

  return (
    <div className={`relative flex flex-col items-center justify-center p-3 select-none ${className}`}>
      {repere && (
        <div className="absolute top-2 left-3 text-xs font-bold text-slate-800 font-mono tracking-wider bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
          {repere}
        </div>
      )}

      <svg
        viewBox={`0 0 ${totalSvgWidth} ${totalSvgHeight}`}
        className="w-full h-auto max-h-[340px] drop-shadow-sm transition-all"
        style={{ maxWidth: `${totalSvgWidth}px` }}
      >
        <defs>
          {/* Glass reflection gradient */}
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#7dd3fc" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.30" />
          </linearGradient>

          {/* Dimension arrow markers */}
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#334155" />
          </marker>
        </defs>

        {/* 1. OUTER DORMANT FRAME */}
        <rect
          x={paddingX}
          y={paddingY}
          width={svgWidth}
          height={svgHeight}
          fill={frameFill}
          stroke={frameStroke}
          strokeWidth="1.5"
          rx="1"
        />

        {/* Frame inner cutout line */}
        <rect
          x={innerFrameX}
          y={innerFrameY}
          width={innerFrameW}
          height={innerFrameH}
          fill="#e2e8f0"
          stroke={frameStroke}
          strokeWidth="1"
        />

        {/* Frame 45° mitre cut lines at corners */}
        <line x1={paddingX} y1={paddingY} x2={innerFrameX} y2={innerFrameY} stroke={frameStroke} strokeWidth="1" strokeDasharray="1,1" />
        <line x1={paddingX + svgWidth} y1={paddingY} x2={innerFrameX + innerFrameW} y2={innerFrameY} stroke={frameStroke} strokeWidth="1" strokeDasharray="1,1" />
        <line x1={paddingX} y1={paddingY + svgHeight} x2={innerFrameX} y2={innerFrameY + innerFrameH} stroke={frameStroke} strokeWidth="1" strokeDasharray="1,1" />
        <line x1={paddingX + svgWidth} y1={paddingY + svgHeight} x2={innerFrameX + innerFrameW} y2={innerFrameY + innerFrameH} stroke={frameStroke} strokeWidth="1" strokeDasharray="1,1" />

        {/* 2. SASHES / OUVRANTS & GLASS PANES */}
        {isFixe ? (
          // Fixed glass direct in frame
          <g>
            <rect
              x={innerFrameX + 4}
              y={innerFrameY + 4}
              width={innerFrameW - 8}
              height={innerFrameH - 8}
              fill="url(#glassGradient)"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
            {/* Parclose line */}
            <rect
              x={innerFrameX}
              y={innerFrameY}
              width={innerFrameW}
              height={innerFrameH}
              fill="none"
              stroke={frameStroke}
              strokeWidth="2"
            />
            {/* Fixe subtle cross indicator */}
            <text
              x={innerFrameX + innerFrameW / 2}
              y={innerFrameY + innerFrameH / 2 + 4}
              textAnchor="middle"
              className="text-[9px] fill-slate-500 font-mono tracking-wider"
            >
              FIXE
            </text>
          </g>
        ) : (
          // One or multiple sashes
          Array.from({ length: sashCount }).map((_, index) => {
            const sashX = innerFrameX + index * (sashWidth + (frameThickness * 0.2));
            const sashY = innerFrameY;
            const glassX = sashX + sashThickness;
            const glassY = sashY + sashThickness;
            const glassW = Math.max(4, sashWidth - sashThickness * 2);
            const glassH = Math.max(4, innerFrameH - sashThickness * 2);

            // Determine opening behavior for this sash
            const isOB =
              configuration === '1_vantail_OB' ||
              (configuration === '2_vantaux_OB_OF' && index === 0);

            const isOF =
              configuration === '1_vantail_OF' ||
              configuration === '2_vantaux_OF' ||
              (configuration === '2_vantaux_OB_OF' && index === 1);

            return (
              <g key={`sash-${index}`}>
                {/* Sash PVC Profile */}
                <rect
                  x={sashX}
                  y={sashY}
                  width={sashWidth}
                  height={innerFrameH}
                  fill={sashFill}
                  stroke={frameStroke}
                  strokeWidth="1.2"
                />

                {/* Sash 45° corner cuts */}
                <line x1={sashX} y1={sashY} x2={glassX} y2={glassY} stroke={frameStroke} strokeWidth="0.8" strokeDasharray="1,1" />
                <line x1={sashX + sashWidth} y1={sashY} x2={glassX + glassW} y2={glassY} stroke={frameStroke} strokeWidth="0.8" strokeDasharray="1,1" />
                <line x1={sashX} y1={sashY + innerFrameH} x2={glassX} y2={glassY + glassH} stroke={frameStroke} strokeWidth="0.8" strokeDasharray="1,1" />
                <line x1={sashX + sashWidth} y1={sashY + innerFrameH} x2={glassX + glassW} y2={glassY + glassH} stroke={frameStroke} strokeWidth="0.8" strokeDasharray="1,1" />

                {/* Glass pane */}
                <rect
                  x={glassX}
                  y={glassY}
                  width={glassW}
                  height={glassH}
                  fill="url(#glassGradient)"
                  stroke="#94a3b8"
                  strokeWidth="0.8"
                />

                {/* Opening dashed architectural symbols */}
                {isCoulissant ? (
                  // Sliding arrows
                  <g stroke="#0284c7" strokeWidth="1.5">
                    <line
                      x1={glassX + glassW * 0.3}
                      y1={glassY + glassH * 0.5}
                      x2={glassX + glassW * 0.7}
                      y2={glassY + glassH * 0.5}
                      markerEnd="url(#arrow)"
                    />
                  </g>
                ) : isOB ? (
                  // Oscillo-Battant: 2 dashed triangles (Tilt + Swing)
                  <g stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" fill="none">
                    {/* Tilt bottom hinge to top center */}
                    <polygon
                      points={`${glassX},${glassY + glassH} ${glassX + glassW / 2},${glassY} ${glassX + glassW},${glassY + glassH}`}
                    />
                    {/* Swing side hinge to handle */}
                    <polyline
                      points={`${index === 0 ? glassX : glassX + glassW},${glassY} ${index === 0 ? glassX + glassW : glassX},${glassY + glassH / 2} ${index === 0 ? glassX : glassX + glassW},${glassY + glassH}`}
                    />
                  </g>
                ) : isOF ? (
                  // Standard French Swing: dashed triangle to handle
                  <g stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" fill="none">
                    <polyline
                      points={`${index === 0 ? glassX : glassX + glassW},${glassY} ${index === 0 ? glassX + glassW : glassX},${glassY + glassH / 2} ${index === 0 ? glassX : glassX + glassW},${glassY + glassH}`}
                    />
                  </g>
                ) : null}

                {/* Handle (Poignée) */}
                {!isFixe && !isCoulissant && (
                  <g>
                    <rect
                      x={index === 0 ? sashX + sashWidth - 6 : sashX + 2}
                      y={sashY + innerFrameH / 2 - 10}
                      width={4}
                      height={20}
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.6"
                      rx="1"
                    />
                    <rect
                      x={index === 0 ? sashX + sashWidth - 10 : sashX + 6}
                      y={sashY + innerFrameH / 2 - 3}
                      width={7}
                      height={6}
                      fill="#94a3b8"
                      stroke="#475569"
                      strokeWidth="0.6"
                      rx="1"
                    />
                  </g>
                )}
              </g>
            );
          })
        )}

        {/* 3. TECHNICAL DIMENSION LINES (Cotes d'encombrement mm) */}
        {showDimensions && (
          <g className="text-[10px] font-mono select-none">
            {/* Top Width Dimension Line */}
            <line
              x1={paddingX}
              y1={paddingY - 18}
              x2={paddingX + svgWidth}
              y2={paddingY - 18}
              stroke="#64748b"
              strokeWidth="0.8"
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            {/* Extension lines */}
            <line x1={paddingX} y1={paddingY - 24} x2={paddingX} y2={paddingY - 4} stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2,2" />
            <line x1={paddingX + svgWidth} y1={paddingY - 24} x2={paddingX + svgWidth} y2={paddingY - 4} stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2,2" />
            {/* Width Text */}
            <text x={paddingX + svgWidth / 2} y={paddingY - 22} textAnchor="middle" className="text-[11px] font-bold fill-slate-800">
              L = {largeurMm} mm
            </text>

            {/* Right Height Dimension Line */}
            <line
              x1={paddingX + svgWidth + 24}
              y1={paddingY}
              x2={paddingX + svgWidth + 24}
              y2={paddingY + svgHeight}
              stroke="#64748b"
              strokeWidth="0.8"
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            {/* Extension lines */}
            <line x1={paddingX + svgWidth + 4} y1={paddingY} x2={paddingX + svgWidth + 30} stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2,2" />
            <line x1={paddingX + svgWidth + 4} y1={paddingY + svgHeight} x2={paddingX + svgWidth + 30} stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2,2" />
            {/* Height Text */}
            <text
              x={paddingX + svgWidth + 36}
              y={paddingY + svgHeight / 2}
              textAnchor="middle"
              transform={`rotate(90, ${paddingX + svgWidth + 36}, ${paddingY + svgHeight / 2})`}
              className="text-[11px] font-bold fill-slate-800"
            >
              H = {hauteurMm} mm
            </text>
          </g>
        )}
      </svg>

      {/* Footer Technical Tag */}
      <div className="mt-2 flex items-center justify-between w-full text-[11px] text-slate-600 font-mono border-t border-slate-200 pt-1.5 px-1">
        <span>{configuration.replace(/_/g, ' ')}</span>
        <span className="font-bold text-slate-700">{((largeurMm * hauteurMm) / 1_000_000).toFixed(2)} m²</span>
      </div>
    </div>
  );
};
