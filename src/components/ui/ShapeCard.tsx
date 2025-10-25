import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import "./shape-card.css";

type Props = {
  title: string;
  description?: string;
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

  // pointer → motion
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sMx = useSpring(mx, { stiffness: 180, damping: 24 });
  const sMy = useSpring(my, { stiffness: 180, damping: 24 });

  // tilt
  const rotX = useTransform(sMy, (v) => (v - 0.5) * 16); // -8..8°
  const rotY = useTransform(sMx, (v) => (0.5 - v) * 16);

  // parallax offsets
  const px = (depth: number) => useTransform(sMx, (v) => (v - 0.5) * depth);
  const py = (depth: number) => useTransform(sMy, (v) => (v - 0.5) * depth);

  function onMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function reset() { mx.set(0.5); my.set(0.5); }

  return (
    <motion.div
      ref={ref}
      className={cn("shape-card", isSelected && "selected")}
      style={{ rotateX: rotX, rotateY: rotY, ["--halo" as any]: color }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
    >
      <div className="stage">
        {/* ground shadow */}
        <motion.div
          className="layer shadow"
          style={{ x: px(-10), y: py(8) }}
        >
          <div className="shadow-ellip" />
        </motion.div>

        {/* base */}
        <motion.div
          className="layer z2"
          style={{ x: px(6), y: py(6) }}
        >
          {baseIcon}
        </motion.div>

        {/* details */}
        {detailsIcon && (
          <motion.div
            className="layer z3"
            style={{ x: px(10), y: py(10) }}
          >
            {detailsIcon}
          </motion.div>
        )}

        {/* edges */}
        {edgesIcon && (
          <motion.div
            className="layer z4 add-glow"
            style={{ x: px(14), y: py(14) }}
          >
            {edgesIcon}
          </motion.div>
        )}

        {/* highlights */}
        {highlightsIcon && (
          <motion.div
            className="layer z5 add-bloom"
            style={{ x: px(18), y: py(18) }}
          >
            {highlightsIcon}
          </motion.div>
        )}
      </div>

      <div className="card-title">{title}</div>
      {description && <div className="card-description">{description}</div>}
      {isSelected && <div className="selected-badge">✓ Selected</div>}
    </motion.div>
  );
}
