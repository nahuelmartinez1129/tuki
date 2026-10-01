"use client";

import {
  getRoulettePrizeStyle,
  type RoulettePrize,
} from "@/lib/data/rewards";

interface RouletteWheelProps {
  rotation: number;
  isSpinning: boolean;
  prizes: RoulettePrize[];
}

export function RouletteWheel({
  rotation,
  isSpinning,
  prizes,
}: RouletteWheelProps) {
  if (prizes.length === 0) {
    return (
      <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        <div className="text-center text-sm text-tuki-cream/60">
          No hay premios disponibles.
        </div>
      </div>
    );
  }

  const segmentAngle = 360 / prizes.length;

  return (
    <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
      {/* Puntero */}
      <div className="absolute -top-2 left-1/2 z-10 h-6 w-6 -translate-x-1/2 rotate-180">
        <div className="h-0 w-0 border-x-[12px] border-t-[20px] border-x-transparent border-t-tuki-yellow drop-shadow" />
      </div>

      <svg
        viewBox="0 0 200 200"
        className="h-full w-full drop-shadow-[0_20px_45px_rgba(11,31,30,0.45)]"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? "transform 4.2s cubic-bezier(0.17, 0.87, 0.32, 1)"
            : "none",
        }}
      >
        <circle
          cx="100"
          cy="100"
          r="98"
          fill="#0B1F1E"
        />

        {prizes.map((prize, i) => {
          const style =
            getRoulettePrizeStyle(prize.tipo);

          const startAngle =
            i * segmentAngle - 90;

          const endAngle =
            startAngle + segmentAngle;

          const start =
            polarPoint(startAngle);

          const end =
            polarPoint(endAngle);

          const midAngle =
            (startAngle + endAngle) / 2;

          const labelPoint =
            polarPoint(midAngle, 62);

          return (
            <g key={prize.id}>
              <path
                d={`M100,100 L${start.x},${start.y} A90,90 0 0,1 ${end.x},${end.y} Z`}
                fill={style.color}
                stroke="#0B1F1E"
                strokeWidth="1.5"
              />

              <text
                x={labelPoint.x}
                y={labelPoint.y}
                fontSize="9"
                fontWeight="700"
                fill={
                  style.isBlank
                    ? "#FFFDF6"
                    : "#0B1F1E"
                }
                textAnchor="middle"
                transform={`rotate(${midAngle + 90}, ${labelPoint.x}, ${labelPoint.y})`}
              >
                {style.emoji}
              </text>
            </g>
          );
        })}

        <circle
          cx="100"
          cy="100"
          r="16"
          fill="#FFFDF6"
        />

        <text
          x="100"
          y="104"
          fontSize="14"
          textAnchor="middle"
        >
          🎰
        </text>
      </svg>
    </div>
  );
}

function polarPoint(
  angleDeg: number,
  radius = 90
) {
  const angleRad =
    (Math.PI / 180) * angleDeg;

  return {
    x: Number(
      (
        100 +
        radius * Math.cos(angleRad)
      ).toFixed(2)
    ),

    y: Number(
      (
        100 +
        radius * Math.sin(angleRad)
      ).toFixed(2)
    ),
  };
}