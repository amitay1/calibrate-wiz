import React from 'react';

/**
 * GD&T (Geometric Dimensioning and Tolerancing) Symbol Library
 * Per ASME Y14.5-2018 and ISO 1101 standards
 */

interface SymbolProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Position Tolerance Symbol (⊕)
 */
export const PositionSymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
    <line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="1.5" />
    <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5" />
  </svg>
);

/**
 * Concentricity / Coaxiality Symbol (⌭)
 */
export const ConcentricitySymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

/**
 * Symmetry Symbol (⌯)
 */
export const SymmetrySymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="20" height="20" stroke={color} strokeWidth="1.5" fill="none" />
    <line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="1.5" />
    <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5" />
  </svg>
);

/**
 * Parallelism Symbol (∥)
 */
export const ParallelismSymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="7" y1="4" x2="7" y2="20" stroke={color} strokeWidth="1.5" />
    <line x1="17" y1="4" x2="17" y2="20" stroke={color} strokeWidth="1.5" />
  </svg>
);

/**
 * Perpendicularity Symbol (⊥)
 */
export const PerpendicularitySymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="1.5" />
    <line x1="5" y1="20" x2="19" y2="20" stroke={color} strokeWidth="1.5" />
  </svg>
);

/**
 * Angularity Symbol (∠)
 */
export const AngularitySymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="4" y1="20" x2="20" y2="20" stroke={color} strokeWidth="1.5" />
    <line x1="4" y1="20" x2="20" y2="4" stroke={color} strokeWidth="1.5" />
  </svg>
);

/**
 * Cylindricity Symbol (⌭)
 */
export const CylindricitySymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="12" cy="8" rx="8" ry="3" stroke={color} strokeWidth="1.5" fill="none" />
    <ellipse cx="12" cy="16" rx="8" ry="3" stroke={color} strokeWidth="1.5" fill="none" />
    <line x1="4" y1="8" x2="4" y2="16" stroke={color} strokeWidth="1.5" />
    <line x1="20" y1="8" x2="20" y2="16" stroke={color} strokeWidth="1.5" />
  </svg>
);

/**
 * Flatness Symbol (⏤)
 */
export const FlatnessSymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="10" width="16" height="4" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

/**
 * Circularity / Roundness Symbol (○)
 */
export const CircularitySymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

/**
 * Straightness Symbol (—)
 */
export const StraightnessSymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.5" />
  </svg>
);

/**
 * Profile of a Line Symbol (⌒)
 */
export const ProfileLineSymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 20 Q12 8, 20 20"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

/**
 * Profile of a Surface Symbol (⌓)
 */
export const ProfileSurfaceSymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 18 Q12 6, 20 18"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M4 14 Q12 10, 20 14"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

/**
 * Circular Runout Symbol (↗)
 */
export const CircularRunoutSymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="4" y1="16" x2="16" y2="4" stroke={color} strokeWidth="1.5" />
    <polygon points="14,2 20,8 16,8 16,12 12,12 12,8" fill={color} />
  </svg>
);

/**
 * Total Runout Symbol (↗↗)
 */
export const TotalRunoutSymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="4" y1="18" x2="14" y2="8" stroke={color} strokeWidth="1.5" />
    <line x1="8" y1="18" x2="18" y2="8" stroke={color} strokeWidth="1.5" />
    <polygon points="16,6 20,10 18,10 18,12 14,12 14,10" fill={color} />
  </svg>
);

/**
 * Maximum Material Condition (MMC) Symbol (Ⓜ)
 */
export const MMCSymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
    <text
      x="12"
      y="17"
      textAnchor="middle"
      fontSize="14"
      fontWeight="bold"
      fill={color}
    >
      M
    </text>
  </svg>
);

/**
 * Least Material Condition (LMC) Symbol (Ⓛ)
 */
export const LMCSymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
    <text
      x="12"
      y="17"
      textAnchor="middle"
      fontSize="14"
      fontWeight="bold"
      fill={color}
    >
      L
    </text>
  </svg>
);

/**
 * Regardless of Feature Size (RFS) Symbol (Ⓢ)
 */
export const RFSSymbol: React.FC<SymbolProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
    <text
      x="12"
      y="17"
      textAnchor="middle"
      fontSize="14"
      fontWeight="bold"
      fill={color}
    >
      S
    </text>
  </svg>
);

/**
 * Datum Symbol (Triangle)
 */
export const DatumSymbol: React.FC<SymbolProps & { label?: string }> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  label = 'A',
}) => (
  <svg
    width={size * 1.5}
    height={size}
    viewBox="0 0 36 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="18,4 26,20 10,20" stroke={color} strokeWidth="1.5" fill="none" />
    <line x1="4" y1="20" x2="32" y2="20" stroke={color} strokeWidth="1.5" />
    <text
      x="18"
      y="16"
      textAnchor="middle"
      fontSize="10"
      fontWeight="bold"
      fill={color}
    >
      {label}
    </text>
  </svg>
);

/**
 * All GD&T Symbols Map
 */
export const GDTSymbolsMap = {
  position: PositionSymbol,
  concentricity: ConcentricitySymbol,
  symmetry: SymmetrySymbol,
  parallelism: ParallelismSymbol,
  perpendicularity: PerpendicularitySymbol,
  angularity: AngularitySymbol,
  cylindricity: CylindricitySymbol,
  flatness: FlatnessSymbol,
  circularity: CircularitySymbol,
  straightness: StraightnessSymbol,
  profileLine: ProfileLineSymbol,
  profileSurface: ProfileSurfaceSymbol,
  circularRunout: CircularRunoutSymbol,
  totalRunout: TotalRunoutSymbol,
  mmc: MMCSymbol,
  lmc: LMCSymbol,
  rfs: RFSSymbol,
  datum: DatumSymbol,
};

export type GDTSymbolType = keyof typeof GDTSymbolsMap;

/**
 * Generic GD&T Symbol Component
 */
interface GDTSymbolProps extends SymbolProps {
  type: GDTSymbolType;
  label?: string;
}

export const GDTSymbol: React.FC<GDTSymbolProps> = ({ type, ...props }) => {
  const SymbolComponent = GDTSymbolsMap[type];
  return <SymbolComponent {...props} />;
};
