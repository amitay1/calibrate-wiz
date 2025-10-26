import React, { useState } from "react";
import { PartGeometry } from "@/types/techniqueSheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ShapeCard from "@/components/ui/ShapeCard";
import { ChevronRight } from "lucide-react";

interface PartTypeVisualSelectorProps {
  value: string;
  onChange: (value: PartGeometry) => void;
}

interface PartTypeOption {
  value: PartGeometry;
  label: string;
  description: string;
  color: string;
}

interface CategoryGroup {
  category: string;
  description: string;
  icon: string;
  options: PartTypeOption[];
}

const categoryGroups: CategoryGroup[] = [
  {
    category: "Forging Stock",
    description: "Wrought feed material intended to be forged",
    icon: "🔨",
    options: [
      {
        value: "round_forging_stock",
        label: "Round Section",
        description: "Round forging stock for forging operations",
        color: "#E74C3C",
      },
      {
        value: "rectangular_forging_stock",
        label: "Rectangular/Billet Section",
        description: "Rectangular billet section for forging",
        color: "#E67E22",
      },
    ],
  },
  {
    category: "Forgings",
    description: "Parts produced by forging operations",
    icon: "⚒️",
    options: [
      {
        value: "ring_forging",
        label: "Ring Forging",
        description: "Forged ring component",
        color: "#9B59B6",
      },
      {
        value: "disk_forging",
        label: "Disk Forging",
        description: "Forged disk component",
        color: "#8E44AD",
      },
      {
        value: "hub",
        label: "Hub",
        description: "Forged hub component",
        color: "#3498DB",
      },
      {
        value: "shaft",
        label: "Shaft",
        description: "Forged shaft component",
        color: "#2980B9",
      },
      {
        value: "near_net_forging",
        label: "Near-Net Forging",
        description: "Near-net shape forging",
        color: "#1ABC9C",
      },
    ],
  },
  {
    category: "Rolled Billet or Plate",
    description: "Flat-rolled rectangular products",
    icon: "📐",
    options: [
      {
        value: "billet",
        label: "Billet",
        description: "Thick rectangular section for further processing",
        color: "#16A085",
      },
      {
        value: "plate",
        label: "Plate",
        description: "Flat product of specified thickness",
        color: "#4A90E2",
      },
      {
        value: "sheet",
        label: "Sheet",
        description: "Thin flat sheet metal",
        color: "#27AE60",
      },
      {
        value: "slab",
        label: "Slab",
        description: "Very thick flat product",
        color: "#2563eb",
      },
    ],
  },
  {
    category: "Extruded or Rolled Bars",
    description: "Long, solid, constant cross-section products",
    icon: "📏",
    options: [
      {
        value: "round_bar",
        label: "Round Bar",
        description: "Solid round bar",
        color: "#F39C12",
      },
      {
        value: "square_bar",
        label: "Square Bar",
        description: "Solid square bar",
        color: "#E67E22",
      },
      {
        value: "rectangular_bar",
        label: "Rectangular/Flat Bar",
        description: "Solid rectangular or flat bar",
        color: "#D35400",
      },
      {
        value: "hex_bar",
        label: "Hex Bar",
        description: "Solid hexagonal bar",
        color: "#C0392B",
      },
      {
        value: "flat_bar",
        label: "Flat Bar",
        description: "Thin rectangular bar",
        color: "#059669",
      },
    ],
  },
  {
    category: "Extruded or Rolled Shapes",
    description: "Structural or custom profiles",
    icon: "🏗️",
    options: [
      {
        value: "extrusion_angle",
        label: "L (Angle)",
        description: "Angle section profile",
        color: "#E74C3C",
      },
      {
        value: "extrusion_t",
        label: "T Section",
        description: "T-shaped structural profile",
        color: "#C0392B",
      },
      {
        value: "extrusion_i",
        label: "I/H-Beam",
        description: "I or H beam structural profile",
        color: "#E67E22",
      },
      {
        value: "extrusion_u",
        label: "U/C-Channel",
        description: "U or C channel profile",
        color: "#D35400",
      },
      {
        value: "extrusion_channel",
        label: "Channel Section",
        description: "Channel structural profile",
        color: "#0c4a6e",
      },
      {
        value: "z_section",
        label: "Z Section",
        description: "Z-shaped profile",
        color: "#F39C12",
      },
      {
        value: "tube",
        label: "Tube",
        description: "Hollow cylindrical tube profile",
        color: "#95A5A6",
      },
      {
        value: "pipe",
        label: "Pipe",
        description: "Hollow pipe profile",
        color: "#7F8C8D",
      },
      {
        value: "rectangular_tube",
        label: "Rectangular Tube",
        description: "Hollow rectangular profile",
        color: "#34495E",
      },
      {
        value: "square_tube",
        label: "Square Tube",
        description: "Hollow square profile",
        color: "#2C3E50",
      },
      {
        value: "custom_profile",
        label: "Other Profiles",
        description: "Custom open or closed profiles",
        color: "#BDC3C7",
      },
    ],
  },
  {
    category: "Machined Parts",
    description: "Components machined from any of the above forms",
    icon: "⚙️",
    options: [
      {
        value: "machined_component",
        label: "Machined Component",
        description: "Any machined part from parent forms",
        color: "#34495E",
      },
      {
        value: "ring",
        label: "Machined Ring",
        description: "Machined ring component",
        color: "#2C3E50",
      },
      {
        value: "disk",
        label: "Machined Disk",
        description: "Machined disk component",
        color: "#7F8C8D",
      },
      {
        value: "cylinder",
        label: "Machined Cylinder",
        description: "Machined cylindrical component",
        color: "#95A5A6",
      },
      {
        value: "sphere",
        label: "Machined Sphere",
        description: "Machined spherical component",
        color: "#BDC3C7",
      },
      {
        value: "cone",
        label: "Machined Cone",
        description: "Machined conical component",
        color: "#ECF0F1",
      },
      {
        value: "sleeve",
        label: "Sleeve",
        description: "Short hollow component",
        color: "#94a3b8",
      },
      {
        value: "bushing",
        label: "Bushing",
        description: "Bearing sleeve component",
        color: "#64748b",
      },
      {
        value: "block",
        label: "Block",
        description: "Solid machined block",
        color: "#f59e0b",
      },
      {
        value: "custom",
        label: "Custom Machined",
        description: "Custom machined geometry",
        color: "#95A5A6",
      },
    ],
  },
];

export const PartTypeVisualSelector: React.FC<PartTypeVisualSelectorProps> = ({
  value,
  onChange,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categoryGroups.map((group) => group.category)
  );

  return (
    <div className="w-full space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Select Part Type
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose the product form that matches your inspection part according to standards
        </p>
      </div>

      <Accordion
        type="multiple"
        value={expandedCategories}
        onValueChange={setExpandedCategories}
        className="w-full space-y-4"
      >
        {categoryGroups.map((group) => (
          <AccordionItem
            key={group.category}
            value={group.category}
            className="border rounded-lg bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline group">
              <div className="flex items-center gap-4 text-left flex-1">
                <span className="text-3xl">{group.icon}</span>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {group.category}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {group.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
                {group.options.map((option) => (
                  <ShapeCard
                    key={option.value}
                    title={option.label}
                    description={option.description}
                    partType={option.value}
                    color={option.color}
                    isSelected={value === option.value}
                    onClick={() => onChange(option.value)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
