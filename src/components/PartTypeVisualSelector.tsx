import React from "react";
import { PartGeometry } from "@/types/techniqueSheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface PartTypeVisualSelectorProps {
  value: string;
  onChange: (value: PartGeometry) => void;
}

interface PartTypeOption {
  value: PartGeometry;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// SVG Icons with 3D effects, gradients, and lighting
const ShapeIcons = {
  plate: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="plateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "currentColor", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.4 }} />
        </linearGradient>
        <filter id="plateShadow">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>
      <rect x="15" y="30" width="90" height="45" fill="url(#plateGrad)" filter="url(#plateShadow)" rx="2"/>
      <rect x="15" y="30" width="90" height="12" fill="currentColor" opacity="0.25"/>
      <path d="M 15 30 L 20 25 L 110 25 L 105 30 Z" fill="currentColor" opacity="0.4"/>
    </svg>
  ),
  flat_bar: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="flatBarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 0.9 }} />
          <stop offset="60%" style={{ stopColor: "currentColor", stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.3 }} />
        </linearGradient>
        <filter id="barShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="3" dy="3" result="offsetblur"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M 20 35 L 25 30 L 95 30 L 100 35 L 100 65 L 95 70 L 25 70 L 20 65 Z" 
            fill="url(#flatBarGrad)" filter="url(#barShadow)"/>
      <rect x="20" y="35" width="80" height="10" fill="currentColor" opacity="0.3"/>
      <path d="M 20 35 L 25 30 L 95 30 L 100 35 Z" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
  rectangular_bar: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="rectBarGrad" x1="30%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "currentColor", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.4 }} />
        </linearGradient>
        <radialGradient id="rectHighlight">
          <stop offset="0%" style={{ stopColor: "#fff", stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: "#fff", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <path d="M 35 30 L 40 25 L 80 25 L 85 30 L 85 70 L 80 75 L 40 75 L 35 70 Z" 
            fill="url(#rectBarGrad)" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="35" y="30" width="50" height="15" fill="url(#rectHighlight)"/>
      <path d="M 35 30 L 40 25 L 80 25 L 85 30 Z" fill="currentColor" opacity="0.5"/>
      <rect x="38" y="33" width="44" height="8" fill="currentColor" opacity="0.2" rx="1"/>
    </svg>
  ),
  round_bar: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <radialGradient id="roundGrad" cx="40%" cy="35%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "currentColor", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.35 }} />
        </radialGradient>
        <linearGradient id="cylinderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 0.5 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.2 }} />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="50" rx="35" ry="30" fill="url(#roundGrad)" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="60" cy="38" rx="35" ry="10" fill="url(#cylinderGrad)"/>
      <ellipse cx="60" cy="38" rx="28" ry="8" fill="currentColor" opacity="0.15"/>
      <path d="M 25 50 L 25 73 Q 60 85 95 73 L 95 50" fill="currentColor" opacity="0.15"/>
      <ellipse cx="55" cy="42" rx="8" ry="6" fill="white" opacity="0.3"/>
    </svg>
  ),
  round_forging_stock: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <radialGradient id="forgingGrad" cx="35%" cy="30%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 1 }} />
          <stop offset="40%" style={{ stopColor: "currentColor", stopOpacity: 0.8 }} />
          <stop offset="80%" style={{ stopColor: "currentColor", stopOpacity: 0.5 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.3 }} />
        </radialGradient>
        <pattern id="grainPattern" patternUnits="userSpaceOnUse" width="8" height="8">
          <circle cx="4" cy="4" r="1" fill="currentColor" opacity="0.15"/>
        </pattern>
      </defs>
      <ellipse cx="60" cy="50" rx="38" ry="32" fill="url(#forgingGrad)" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="60" cy="36" rx="38" ry="12" fill="currentColor" opacity="0.35"/>
      <ellipse cx="60" cy="50" rx="38" ry="32" fill="url(#grainPattern)"/>
      <circle cx="60" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.4"/>
      <ellipse cx="52" cy="40" rx="10" ry="8" fill="white" opacity="0.25"/>
    </svg>
  ),
  ring_forging: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 0.95 }} />
          <stop offset="50%" style={{ stopColor: "currentColor", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.4 }} />
        </linearGradient>
        <radialGradient id="ringHighlight" cx="35%" cy="30%">
          <stop offset="0%" style={{ stopColor: "#fff", stopOpacity: 0.4 }} />
          <stop offset="100%" style={{ stopColor: "#fff", stopOpacity: 0 }} />
        </radialGradient>
        <filter id="ringShadow">
          <feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity="0.35"/>
        </filter>
      </defs>
      <ellipse cx="60" cy="50" rx="40" ry="32" fill="none" stroke="url(#ringGrad)" strokeWidth="12" filter="url(#ringShadow)"/>
      <ellipse cx="60" cy="38" rx="40" ry="12" fill="currentColor" opacity="0.3"/>
      <ellipse cx="60" cy="62" rx="40" ry="12" fill="currentColor" opacity="0.15"/>
      <ellipse cx="60" cy="50" rx="40" ry="32" fill="url(#ringHighlight)" pointerEvents="none"/>
      <path d="M 20 50 Q 20 40 28 38 Q 30 48 32 50 Q 30 52 28 62 Q 20 60 20 50 Z" fill="white" opacity="0.2"/>
    </svg>
  ),
  disk_forging: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <radialGradient id="diskGrad" cx="40%" cy="35%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 1 }} />
          <stop offset="60%" style={{ stopColor: "currentColor", stopOpacity: 0.75 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.4 }} />
        </radialGradient>
        <filter id="diskShadow">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>
      <ellipse cx="60" cy="50" rx="40" ry="35" fill="url(#diskGrad)" stroke="currentColor" strokeWidth="1.5" filter="url(#diskShadow)"/>
      <ellipse cx="60" cy="35" rx="40" ry="14" fill="currentColor" opacity="0.35"/>
      <circle cx="60" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
      <circle cx="60" cy="50" r="10" fill="currentColor" opacity="0.1"/>
      <ellipse cx="50" cy="38" rx="12" ry="9" fill="white" opacity="0.3"/>
    </svg>
  ),
  hex_bar: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="hexGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 0.5 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.8 }} />
        </linearGradient>
        <linearGradient id="hexGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.6 }} />
        </linearGradient>
        <linearGradient id="hexGrad3" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 0.4 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.7 }} />
        </linearGradient>
      </defs>
      <polygon points="60,20 85,32.5 85,57.5 60,70 35,57.5 35,32.5" 
               fill="url(#hexGrad2)" stroke="currentColor" strokeWidth="1.5"/>
      <polygon points="60,20 65,17 90,29.5 85,32.5" fill="url(#hexGrad1)"/>
      <polygon points="85,32.5 90,29.5 90,54.5 85,57.5" fill="url(#hexGrad3)"/>
      <polygon points="60,20 85,32.5 85,37 60,24.5 35,37 35,32.5" fill="currentColor" opacity="0.35"/>
      <path d="M 48 35 L 52 30 L 68 30 L 72 35 Z" fill="white" opacity="0.25"/>
    </svg>
  ),
  tube: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 0.9 }} />
          <stop offset="50%" style={{ stopColor: "currentColor", stopOpacity: 0.65 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.35 }} />
        </linearGradient>
        <radialGradient id="tubeInner" cx="50%" cy="50%">
          <stop offset="0%" style={{ stopColor: "#000", stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: "#000", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="50" rx="35" ry="28" fill="none" stroke="url(#tubeGrad)" strokeWidth="12"/>
      <ellipse cx="60" cy="38" rx="35" ry="10" fill="currentColor" opacity="0.3"/>
      <ellipse cx="60" cy="62" rx="35" ry="10" fill="currentColor" opacity="0.15"/>
      <ellipse cx="60" cy="50" rx="18" ry="14" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="60" cy="50" rx="18" ry="14" fill="url(#tubeInner)"/>
      <path d="M 25 50 Q 25 42 30 40 L 32 45 Q 28 47 28 50 Q 28 53 32 55 L 30 60 Q 25 58 25 50 Z" 
            fill="white" opacity="0.25"/>
    </svg>
  ),
  bar: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="genericBarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.4 }} />
        </linearGradient>
      </defs>
      <path d="M 25 35 L 30 30 L 90 30 L 95 35 L 95 65 L 90 70 L 30 70 L 25 65 Z" 
            fill="url(#genericBarGrad)" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,2"/>
      <path d="M 25 35 L 30 30 L 90 30 L 95 35 Z" fill="currentColor" opacity="0.3"/>
      <text x="60" y="55" fontSize="20" fontWeight="bold" fill="currentColor" textAnchor="middle" opacity="0.5">?</text>
    </svg>
  ),
  forging: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <radialGradient id="genericForgingGrad" cx="40%" cy="35%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 0.85 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.4 }} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="50" rx="35" ry="30" fill="url(#genericForgingGrad)" 
               stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3"/>
      <ellipse cx="60" cy="37" rx="35" ry="11" fill="currentColor" opacity="0.3"/>
      <text x="60" y="58" fontSize="22" fontWeight="bold" fill="hsl(var(--background))" textAnchor="middle">F</text>
    </svg>
  ),
  ring: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <linearGradient id="genericRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 0.75 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.4 }} />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="50" rx="35" ry="28" fill="none" stroke="url(#genericRingGrad)" 
               strokeWidth="10" strokeDasharray="4,2"/>
      <ellipse cx="60" cy="38" rx="35" ry="10" fill="currentColor" opacity="0.25"/>
      <text x="60" y="58" fontSize="20" fontWeight="bold" fill="currentColor" textAnchor="middle" opacity="0.5">?</text>
    </svg>
  ),
  disk: (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <radialGradient id="genericDiskGrad" cx="40%" cy="35%">
          <stop offset="0%" style={{ stopColor: "currentColor", stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: "currentColor", stopOpacity: 0.4 }} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="50" rx="37" ry="32" fill="url(#genericDiskGrad)" 
               stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3"/>
      <ellipse cx="60" cy="36" rx="37" ry="12" fill="currentColor" opacity="0.3"/>
      <text x="60" y="58" fontSize="20" fontWeight="bold" fill="hsl(var(--background))" textAnchor="middle" opacity="0.7">?</text>
    </svg>
  ),
};

const partTypeOptions: PartTypeOption[] = [
  { 
    value: "plate", 
    label: "Plate", 
    description: "W/T > 5",
    icon: ShapeIcons.plate
  },
  { 
    value: "flat_bar", 
    label: "Flat Bar", 
    description: "W/T > 5",
    icon: ShapeIcons.flat_bar
  },
  { 
    value: "rectangular_bar", 
    label: "Rectangular Bar", 
    description: "W/T < 5",
    icon: ShapeIcons.rectangular_bar
  },
  { 
    value: "round_bar", 
    label: "Round Bar", 
    description: "Radial + axial",
    icon: ShapeIcons.round_bar
  },
  { 
    value: "round_forging_stock", 
    label: "Round Forging", 
    description: "Grain structure",
    icon: ShapeIcons.round_forging_stock
  },
  { 
    value: "ring_forging", 
    label: "Ring Forging ⭐", 
    description: "Full coverage",
    icon: ShapeIcons.ring_forging
  },
  { 
    value: "disk_forging", 
    label: "Disk Forging", 
    description: "Flat + radial",
    icon: ShapeIcons.disk_forging
  },
  { 
    value: "hex_bar", 
    label: "Hex Bar", 
    description: "3 adj. faces",
    icon: ShapeIcons.hex_bar
  },
  { 
    value: "tube", 
    label: "Tube", 
    description: "ID + OD",
    icon: ShapeIcons.tube
  },
  { 
    value: "bar", 
    label: "Bar (Generic)", 
    description: "Unspecified",
    icon: ShapeIcons.bar
  },
  { 
    value: "forging", 
    label: "Forging (Generic)", 
    description: "Unspecified",
    icon: ShapeIcons.forging
  },
  { 
    value: "ring", 
    label: "Ring (Generic)", 
    description: "Use specific",
    icon: ShapeIcons.ring
  },
  { 
    value: "disk", 
    label: "Disk (Generic)", 
    description: "Use specific",
    icon: ShapeIcons.disk
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
            <CarouselItem key={option.value} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
                  value === option.value
                    ? "ring-2 ring-primary shadow-lg bg-primary/5"
                    : "hover:bg-accent/50"
                )}
                onClick={() => onChange(option.value)}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  {/* Visual Icon */}
                  <div className={cn(
                    "w-20 h-16 flex items-center justify-center rounded-lg transition-colors",
                    value === option.value ? "text-primary" : "text-muted-foreground"
                  )}>
                    {option.icon}
                  </div>
                  
                  {/* Label */}
                  <div className="text-center space-y-1 w-full">
                    <p className={cn(
                      "text-sm font-medium leading-tight",
                      value === option.value ? "text-primary" : "text-foreground"
                    )}>
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {option.description}
                    </p>
                  </div>
                  
                  {/* Selected Badge */}
                  {value === option.value && (
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};
