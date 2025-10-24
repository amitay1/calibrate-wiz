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

// SVG Icons for each shape
const ShapeIcons = {
  plate: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <rect x="10" y="20" width="80" height="40" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="2"/>
      <rect x="10" y="20" width="80" height="8" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  flat_bar: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <rect x="15" y="25" width="70" height="30" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="2"/>
      <line x1="15" y1="25" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/>
      <line x1="85" y1="25" x2="90" y2="20" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  rectangular_bar: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <rect x="25" y="20" width="50" height="40" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="2"/>
      <rect x="25" y="20" width="50" height="10" fill="currentColor" opacity="0.3"/>
      <line x1="25" y1="20" x2="30" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="75" y1="20" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  round_bar: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <ellipse cx="50" cy="40" rx="30" ry="25" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="50" cy="32" rx="30" ry="8" fill="currentColor" opacity="0.3"/>
      <line x1="20" y1="40" x2="20" y2="65" stroke="currentColor" strokeWidth="2"/>
      <line x1="80" y1="40" x2="80" y2="65" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  round_forging_stock: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <ellipse cx="50" cy="40" rx="32" ry="28" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="50" cy="32" rx="32" ry="10" fill="currentColor" opacity="0.3"/>
      <circle cx="50" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
    </svg>
  ),
  ring_forging: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <ellipse cx="50" cy="40" rx="35" ry="28" fill="none" stroke="currentColor" strokeWidth="8" opacity="0.8"/>
      <ellipse cx="50" cy="32" rx="35" ry="10" fill="currentColor" opacity="0.3"/>
      <ellipse cx="50" cy="48" rx="35" ry="10" fill="currentColor" opacity="0.2"/>
    </svg>
  ),
  disk_forging: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <ellipse cx="50" cy="40" rx="35" ry="30" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="50" cy="30" rx="35" ry="12" fill="currentColor" opacity="0.3"/>
      <circle cx="50" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  hex_bar: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <polygon points="50,15 75,27.5 75,52.5 50,65 25,52.5 25,27.5" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="2"/>
      <polygon points="50,15 75,27.5 75,32 50,19.5 25,32 25,27.5" fill="currentColor" opacity="0.3"/>
      <line x1="50" y1="15" x2="55" y2="10" stroke="currentColor" strokeWidth="2"/>
      <line x1="75" y1="27.5" x2="80" y2="22.5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  tube: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <ellipse cx="50" cy="40" rx="30" ry="25" fill="none" stroke="currentColor" strokeWidth="8" opacity="0.8"/>
      <ellipse cx="50" cy="32" rx="30" ry="8" fill="currentColor" opacity="0.3"/>
      <ellipse cx="50" cy="48" rx="30" ry="8" fill="currentColor" opacity="0.2"/>
      <ellipse cx="50" cy="40" rx="15" ry="12" fill="background" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  bar: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <rect x="20" y="25" width="60" height="30" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="2"/>
      <rect x="20" y="25" width="60" height="8" fill="currentColor" opacity="0.3"/>
      <text x="50" y="45" fontSize="12" fill="currentColor" textAnchor="middle">?</text>
    </svg>
  ),
  forging: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <ellipse cx="50" cy="40" rx="30" ry="25" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="50" cy="32" rx="30" ry="8" fill="currentColor" opacity="0.3"/>
      <text x="50" y="45" fontSize="12" fill="background" textAnchor="middle">F</text>
    </svg>
  ),
  ring: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <ellipse cx="50" cy="40" rx="30" ry="25" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.8"/>
      <ellipse cx="50" cy="32" rx="30" ry="8" fill="currentColor" opacity="0.3"/>
      <text x="50" y="45" fontSize="12" fill="currentColor" textAnchor="middle">?</text>
    </svg>
  ),
  disk: (
    <svg viewBox="0 0 100 80" className="w-full h-full">
      <ellipse cx="50" cy="40" rx="32" ry="27" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="50" cy="30" rx="32" ry="10" fill="currentColor" opacity="0.3"/>
      <text x="50" y="45" fontSize="12" fill="background" textAnchor="middle">?</text>
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
