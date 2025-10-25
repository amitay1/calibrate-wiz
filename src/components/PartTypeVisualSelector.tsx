import React from "react";
import { PartGeometry } from "@/types/techniqueSheet";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ShapeCard from "@/components/ui/ShapeCard";

interface PartTypeVisualSelectorProps {
  value: string;
  onChange: (value: PartGeometry) => void;
}

interface PartTypeOption {
  value: PartGeometry;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// SVG Icons - Each shape is UNIQUE and DISTINCTIVE
const ShapeIcons = {
  // 1. PLATE - Wide, thin, flat view from above
  plate: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="plateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 0.9 }} />
          <stop offset="50%" style={{ stopColor: "#60a5fa", stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: "#93c5fd", stopOpacity: 0.7 }} />
        </linearGradient>
      </defs>
      {/* Top surface - very wide */}
      <rect x="10" y="25" width="100" height="50" fill="url(#plateGrad)" stroke="#1e40af" strokeWidth="2" rx="3"/>
      {/* Thickness indicator - thin edge */}
      <rect x="10" y="75" width="100" height="6" fill="#1e3a8a" opacity="0.6"/>
      <text x="60" y="55" fontSize="14" fontWeight="bold" fill="#1e40af" textAnchor="middle">PLATE</text>
    </svg>
  ),

  // 2. FLAT BAR - Rectangular, medium width, side view
  flat_bar: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="flatBarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#10b981", stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: "#34d399", stopOpacity: 0.6 }} />
        </linearGradient>
      </defs>
      {/* 3D perspective flat bar */}
      <path d="M 15 35 L 25 25 L 95 25 L 105 35 L 105 65 L 95 75 L 25 75 L 15 65 Z" 
            fill="url(#flatBarGrad)" stroke="#047857" strokeWidth="2"/>
      {/* Top face */}
      <path d="M 15 35 L 25 25 L 95 25 L 105 35 Z" fill="#10b981" opacity="0.5"/>
      {/* Side face */}
      <path d="M 105 35 L 105 65 L 95 75 L 95 25 Z" fill="#047857" opacity="0.4"/>
      <line x1="15" y1="50" x2="105" y2="50" stroke="#fff" strokeWidth="1" opacity="0.3" strokeDasharray="5,5"/>
    </svg>
  ),

  // 3. RECTANGULAR BAR - Square cross-section, thick
  rectangular_bar: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="rectGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#f59e0b", stopOpacity: 0.95 }} />
          <stop offset="100%" style={{ stopColor: "#fbbf24", stopOpacity: 0.7 }} />
        </linearGradient>
      </defs>
      {/* Thick square bar in 3D */}
      <path d="M 30 25 L 45 15 L 90 15 L 105 25 L 105 75 L 90 85 L 45 85 L 30 75 Z" 
            fill="url(#rectGrad)" stroke="#d97706" strokeWidth="2"/>
      {/* Top face - visible */}
      <path d="M 30 25 L 45 15 L 90 15 L 105 25 Z" fill="#fbbf24" opacity="0.6"/>
      {/* Right face */}
      <path d="M 105 25 L 105 75 L 90 85 L 90 15 Z" fill="#b45309" opacity="0.5"/>
      {/* Grid pattern for thickness */}
      <rect x="40" y="40" width="50" height="30" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3"/>
    </svg>
  ),

  // 4. ROUND BAR - Cylinder lying down, clearly round
  round_bar: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <radialGradient id="roundGrad" cx="30%" cy="40%">
          <stop offset="0%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }} />
          <stop offset="70%" style={{ stopColor: "#a78bfa", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "#c4b5fd", stopOpacity: 0.5 }} />
        </radialGradient>
      </defs>
      {/* Cylinder body */}
      <ellipse cx="60" cy="50" rx="40" ry="28" fill="url(#roundGrad)" stroke="#6d28d9" strokeWidth="2"/>
      {/* Highlight strip */}
      <ellipse cx="45" cy="40" rx="15" ry="20" fill="#fff" opacity="0.3"/>
      {/* Circular ends visible */}
      <circle cx="25" cy="50" r="12" fill="#6d28d9" opacity="0.4" stroke="#4c1d95" strokeWidth="1.5"/>
      <circle cx="95" cy="50" r="12" fill="#a78bfa" opacity="0.3" stroke="#6d28d9" strokeWidth="1.5"/>
      {/* Axis line */}
      <line x1="20" y1="50" x2="100" y2="50" stroke="#4c1d95" strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
    </svg>
  ),

  // 5. ROUND FORGING STOCK - Round with grain flow pattern
  round_forging_stock: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <radialGradient id="forgingGrad" cx="35%" cy="35%">
          <stop offset="0%" style={{ stopColor: "#ef4444", stopOpacity: 0.95 }} />
          <stop offset="60%" style={{ stopColor: "#f87171", stopOpacity: 0.75 }} />
          <stop offset="100%" style={{ stopColor: "#fca5a5", stopOpacity: 0.55 }} />
        </radialGradient>
        <pattern id="grain" patternUnits="userSpaceOnUse" width="15" height="15">
          <path d="M 0 7.5 Q 7.5 5 15 7.5" stroke="#991b1b" strokeWidth="1" fill="none" opacity="0.3"/>
        </pattern>
      </defs>
      {/* Forging stock with grain flow */}
      <ellipse cx="60" cy="50" rx="42" ry="32" fill="url(#forgingGrad)" stroke="#991b1b" strokeWidth="2"/>
      <ellipse cx="60" cy="50" rx="42" ry="32" fill="url(#grain)"/>
      {/* Grain direction indicators */}
      <path d="M 30 50 Q 60 35 90 50" stroke="#7f1d1d" strokeWidth="2" fill="none" opacity="0.4"/>
      <path d="M 30 55 Q 60 70 90 55" stroke="#7f1d1d" strokeWidth="2" fill="none" opacity="0.4"/>
      {/* Center mark */}
      <circle cx="60" cy="50" r="8" fill="none" stroke="#fff" strokeWidth="2" opacity="0.4"/>
    </svg>
  ),

  // 6. RING FORGING - Obvious ring/donut shape with star
  ring_forging: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ec4899", stopOpacity: 0.95 }} />
          <stop offset="50%" style={{ stopColor: "#f472b6", stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: "#f9a8d4", stopOpacity: 0.6 }} />
        </linearGradient>
      </defs>
      {/* Ring/Torus shape */}
      <ellipse cx="60" cy="50" rx="45" ry="35" fill="none" stroke="url(#ringGrad)" strokeWidth="16"/>
      {/* Inner hole - clearly visible */}
      <ellipse cx="60" cy="50" rx="22" ry="16" fill="hsl(var(--background))" stroke="#be185d" strokeWidth="2"/>
      {/* 3D depth effect */}
      <ellipse cx="60" cy="42" rx="45" ry="12" fill="#ec4899" opacity="0.3"/>
      <ellipse cx="60" cy="58" rx="45" ry="12" fill="#be185d" opacity="0.2"/>
      {/* Star indicator */}
      <text x="105" y="25" fontSize="16">⭐</text>
      {/* Highlight */}
      <path d="M 20 35 Q 25 30 35 35" stroke="#fff" strokeWidth="3" opacity="0.5" fill="none"/>
    </svg>
  ),

  // 7. DISK FORGING - Flat disk with center hole
  disk_forging: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <radialGradient id="diskGrad" cx="40%" cy="30%">
          <stop offset="0%" style={{ stopColor: "#14b8a6", stopOpacity: 1 }} />
          <stop offset="60%" style={{ stopColor: "#2dd4bf", stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: "#5eead4", stopOpacity: 0.6 }} />
        </radialGradient>
      </defs>
      {/* Disk main body */}
      <ellipse cx="60" cy="50" rx="48" ry="38" fill="url(#diskGrad)" stroke="#0f766e" strokeWidth="2"/>
      {/* Top edge - flat appearance */}
      <ellipse cx="60" cy="35" rx="48" ry="15" fill="#14b8a6" opacity="0.4"/>
      {/* Center hole */}
      <ellipse cx="60" cy="50" rx="14" ry="11" fill="hsl(var(--background))" stroke="#0f766e" strokeWidth="2.5"/>
      <ellipse cx="60" cy="50" rx="14" ry="11" fill="#000" opacity="0.15"/>
      {/* Radial lines for disk appearance */}
      <line x1="60" y1="12" x2="60" y2="35" stroke="#0d9488" strokeWidth="1.5" opacity="0.4"/>
      <line x1="30" y1="30" x2="45" y2="42" stroke="#0d9488" strokeWidth="1.5" opacity="0.4"/>
      <line x1="90" y1="30" x2="75" y2="42" stroke="#0d9488" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  ),

  // 8. HEX BAR - Clear hexagon with 6 visible sides
  hex_bar: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="hexFace1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#06b6d4", stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: "#22d3ee", stopOpacity: 0.7 }} />
        </linearGradient>
        <linearGradient id="hexFace2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#0891b2", stopOpacity: 0.85 }} />
          <stop offset="100%" style={{ stopColor: "#06b6d4", stopOpacity: 0.6 }} />
        </linearGradient>
        <linearGradient id="hexFace3" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#164e63", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "#0891b2", stopOpacity: 0.5 }} />
        </linearGradient>
      </defs>
      {/* Hexagon in 3D - main face */}
      <polygon points="60,18 88,33 88,63 60,78 32,63 32,33" 
               fill="url(#hexFace2)" stroke="#0e7490" strokeWidth="2"/>
      {/* Top face */}
      <polygon points="60,18 68,13 96,28 88,33" fill="url(#hexFace1)"/>
      {/* Right face */}
      <polygon points="88,33 96,28 96,58 88,63" fill="url(#hexFace3)"/>
      {/* Hex labels on faces */}
      <text x="60" y="52" fontSize="20" fontWeight="bold" fill="#fff" textAnchor="middle">HEX</text>
      {/* Edge highlights */}
      <line x1="60" y1="18" x2="88" y2="33" stroke="#67e8f9" strokeWidth="1.5" opacity="0.6"/>
      <line x1="32" y1="33" x2="32" y2="63" stroke="#164e63" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  ),

  // 9. TUBE - Hollow cylinder with visible wall thickness
  tube: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="tubeOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#64748b", stopOpacity: 0.95 }} />
          <stop offset="50%" style={{ stopColor: "#94a3b8", stopOpacity: 0.75 }} />
          <stop offset="100%" style={{ stopColor: "#cbd5e1", stopOpacity: 0.55 }} />
        </linearGradient>
      </defs>
      {/* Outer wall */}
      <ellipse cx="60" cy="50" rx="42" ry="30" fill="none" stroke="url(#tubeOuter)" strokeWidth="14"/>
      {/* Wall thickness visible on ends */}
      <ellipse cx="60" cy="38" rx="42" ry="10" fill="#475569" opacity="0.4"/>
      <ellipse cx="60" cy="62" rx="42" ry="10" fill="#1e293b" opacity="0.3"/>
      {/* Inner hollow space - clear void */}
      <ellipse cx="60" cy="50" rx="25" ry="18" fill="hsl(var(--background))" stroke="#334155" strokeWidth="2"/>
      <ellipse cx="60" cy="50" rx="25" ry="18" fill="#000" opacity="0.2"/>
      {/* Wall thickness indicator */}
      <line x1="18" y1="50" x2="35" y2="50" stroke="#f59e0b" strokeWidth="2.5"/>
      <text x="10" y="45" fontSize="10" fill="#f59e0b" fontWeight="bold">t</text>
      {/* Shine effect */}
      <ellipse cx="40" cy="38" rx="12" ry="8" fill="#fff" opacity="0.4"/>
    </svg>
  ),

  // 10. BAR (Generic) - Simple bar with question mark
  bar: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="genericBar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#71717a", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "#a1a1aa", stopOpacity: 0.5 }} />
        </linearGradient>
      </defs>
      <rect x="20" y="35" width="80" height="30" fill="url(#genericBar)" 
            stroke="#52525b" strokeWidth="2" strokeDasharray="5,3" rx="2"/>
      <text x="60" y="57" fontSize="28" fontWeight="bold" fill="#27272a" textAnchor="middle">?</text>
      <text x="60" y="85" fontSize="12" fill="#52525b" textAnchor="middle">Generic Bar</text>
    </svg>
  ),

  // 11. FORGING (Generic) - Round forging with F
  forging: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <radialGradient id="genericForging" cx="40%" cy="35%">
          <stop offset="0%" style={{ stopColor: "#78716c", stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: "#a8a29e", stopOpacity: 0.5 }} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="50" rx="38" ry="30" fill="url(#genericForging)" 
               stroke="#57534e" strokeWidth="2" strokeDasharray="4,2"/>
      <text x="60" y="60" fontSize="32" fontWeight="bold" fill="#292524" textAnchor="middle">F</text>
      <text x="60" y="85" fontSize="11" fill="#57534e" textAnchor="middle">Generic Forging</text>
    </svg>
  ),

  // 12. RING (Generic) - Simple ring with question mark
  ring: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="genericRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#6b7280", stopOpacity: 0.75 }} />
          <stop offset="100%" style={{ stopColor: "#9ca3af", stopOpacity: 0.5 }} />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="50" rx="38" ry="28" fill="none" 
               stroke="url(#genericRing)" strokeWidth="12" strokeDasharray="6,3"/>
      <text x="60" y="57" fontSize="26" fontWeight="bold" fill="#4b5563" textAnchor="middle">?</text>
      <text x="60" y="85" fontSize="11" fill="#4b5563" textAnchor="middle">Generic Ring</text>
    </svg>
  ),

  // 13. DISK (Generic) - Flat disk with question mark
  disk: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <radialGradient id="genericDisk" cx="40%" cy="35%">
          <stop offset="0%" style={{ stopColor: "#737373", stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: "#a3a3a3", stopOpacity: 0.5 }} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="50" rx="40" ry="32" fill="url(#genericDisk)" 
               stroke="#525252" strokeWidth="2" strokeDasharray="4,2"/>
      <ellipse cx="60" cy="38" rx="40" ry="12" fill="#404040" opacity="0.3"/>
      <text x="60" y="58" fontSize="30" fontWeight="bold" fill="#262626" textAnchor="middle">?</text>
      <text x="60" y="85" fontSize="11" fill="#525252" textAnchor="middle">Generic Disk</text>
    </svg>
  ),
};

const partTypeOptions: PartTypeOption[] = [
  // PLATES & SHEETS
  { 
    value: "plate", 
    label: "Plate / Sheet", 
    description: "Flat thin surface",
    icon: ShapeIcons.plate,
    color: "#3b82f6"
  },
  
  // SOLID BARS
  { 
    value: "round_bar", 
    label: "Round Bar", 
    description: "Solid cylinder",
    icon: ShapeIcons.round_bar,
    color: "#8b5cf6"
  },
  { 
    value: "square_bar", 
    label: "Square Bar", 
    description: "4-sided solid",
    icon: ShapeIcons.rectangular_bar,
    color: "#f59e0b"
  },
  { 
    value: "hex_bar", 
    label: "Hex Bar", 
    description: "6-sided solid",
    icon: ShapeIcons.hex_bar,
    color: "#06b6d4"
  },
  { 
    value: "rectangular_bar", 
    label: "Rectangular Bar", 
    description: "Flat cross-section",
    icon: ShapeIcons.flat_bar,
    color: "#10b981"
  },
  
  // HOLLOW (TUBES/PIPES)
  { 
    value: "tube", 
    label: "Tube / Pipe", 
    description: "Hollow cylinder",
    icon: ShapeIcons.tube,
    color: "#64748b"
  },
  
  // DISKS
  { 
    value: "disk", 
    label: "Disk", 
    description: "Flat circular",
    icon: ShapeIcons.disk_forging,
    color: "#14b8a6"
  },
  
  // RINGS
  { 
    value: "ring", 
    label: "Ring ⭐", 
    description: "Hollow ring/torus",
    icon: ShapeIcons.ring_forging,
    color: "#ec4899"
  },
  
  // SHAFTS
  { 
    value: "shaft", 
    label: "Shaft", 
    description: "Long cylinder",
    icon: ShapeIcons.round_bar,
    color: "#a78bfa"
  },
  
  // FORGINGS
  { 
    value: "forging", 
    label: "Forging", 
    description: "Irregular shape",
    icon: ShapeIcons.forging,
    color: "#78716c"
  },
  
  // BILLETS/BLOCKS
  { 
    value: "billet", 
    label: "Billet / Block", 
    description: "Large rectangular",
    icon: ShapeIcons.rectangular_bar,
    color: "#fbbf24"
  },
  
  // SLEEVES/BUSHINGS
  { 
    value: "sleeve", 
    label: "Sleeve / Bushing", 
    description: "Short hollow",
    icon: ShapeIcons.tube,
    color: "#94a3b8"
  },
];

export const PartTypeVisualSelector: React.FC<PartTypeVisualSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {partTypeOptions.map((option) => (
            <CarouselItem key={option.value} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <ShapeCard
                title={option.label}
                description={option.description}
                baseIcon={option.icon}
                color={option.color}
                isSelected={value === option.value}
                onClick={() => onChange(option.value)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-12" />
        <CarouselNext className="-right-12" />
      </Carousel>
    </div>
  );
};
