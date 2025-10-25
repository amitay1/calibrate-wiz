import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import "./shape-card.css";

type Props = {
  title: string;
  description: string;
  baseIcon: React.ReactNode;
  edgesIcon?: React.ReactNode;
  highlightsIcon?: React.ReactNode;
  detailsIcon?: React.ReactNode;
  color: string;
  isSelected: boolean;
  onClick: () => void;
};

export default function ShapeCard({
  title,
  description,
  baseIcon,
  edgesIcon,
  highlightsIcon,
  detailsIcon,
  color,
  isSelected,
  onClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sMx = useSpring(mx, { stiffness: 180, damping: 24 });
  const sMy = useSpring(my, { stiffness: 180, damping: 24 });

  const rotX = useTransform(sMy, (v) => (v - 0.5) * 40); // -20°..20°
  const rotY = useTransform(sMx, (v) => (0.5 - v) * 40); // -20°..20°

  function onMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }

  function reset() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      className={cn("shape-card", isSelected && "selected")}
      style={
        {
          rotateX: rotX,
          rotateY: rotY,
          "--halo": color,
        } as any
      }
      onMouseMove={onMove}
      onMouseLeave={reset}
      onClick={onClick}
      initial={{ rotateX: 0, rotateY: 0, z: 0 }}
      whileHover={{ scale: 1.08, z: 50 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="stage">
        {/* Shadow layer */}
        <div className="layer shadow">
          <div
            style={{
              width: "80%",
              height: "20%",
              background: "radial-gradient(ellipse, hsl(var(--foreground) / 0.3) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* Base icon layer */}
        <div className="layer z2">{baseIcon}</div>

        {/* Details layer (grain, texture) */}
        {detailsIcon && <div className="layer z3">{detailsIcon}</div>}

        {/* Edges layer (outlines) */}
        {edgesIcon && <div className="layer z4 add-glow">{edgesIcon}</div>}

        {/* Highlights layer (rim light, bloom) */}
        {highlightsIcon && <div className="layer z5 add-bloom">{highlightsIcon}</div>}
      </div>

      {/* Title */}
      <div className="card-title">{title}</div>

      {/* Description */}
      <div className="card-description">{description}</div>

      {/* Selected badge */}
      {isSelected && <div className="selected-badge">✓ Selected</div>}
    </motion.div>
  );
}
