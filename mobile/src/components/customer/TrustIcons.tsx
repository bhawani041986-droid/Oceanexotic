import React from 'react';
import Svg, { Path, Circle, Rect, G, Ellipse } from 'react-native-svg';

// 1. Shield Check Icon (Teal)
export function ShieldCheckIcon({ size = 20, color = "#0d9488" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        fill={`${color}15`}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 11l2 2 4-4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 2. Instant Clock with Flames Icon (Orange)
export function InstantClockIcon({ size = 20, color = "#ea580c" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Flame lines on the left */}
      <Path
        d="M2 12c1.5-2 3.5-3 5-3M1 15c2-1 4-1.5 5.5-1.5M3 9c1-1.5 2.5-2.5 4-2.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Clock outline */}
      <Circle cx="14" cy="12" r="7" stroke={color} strokeWidth="2" fill={`${color}15`} />
      {/* Clock hands */}
      <Path
        d="M14 8v4l2.5 1.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// 3. Cold Chain Snowflake + Thermometer Icon (Blue)
export function ColdChainIcon({ size = 20, color = "#0284c7" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Snowflake lines on the left */}
      <G transform="translate(-1, 0)">
        <Path d="M10 4v12M5 10h10M6.5 6.5l7 7M6.5 13.5l7-7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <Path d="M8 6L10 4L12 6M8 14L10 16L12 14M6 8L4 10L6 12M14 8L16 10L14 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </G>
      {/* Thermometer on the right */}
      <Path
        d="M18 5a1.5 1.5 0 0 1 3 0v6.5a2.5 2.5 0 1 1-3 0V5z"
        fill={`${color}15`}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="19.5" cy="14.5" r="1" fill={color} />
    </Svg>
  );
}

// 4. Local Catch Map Pin Icon (Red)
export function LocalCatchIcon({ size = 20, color = "#e11d48" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Ellipse platform */}
      <Ellipse cx="12" cy="18" rx="5" ry="1.5" stroke={`${color}66`} strokeWidth="1" />
      {/* Map Pin */}
      <Path
        d="M12 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6z"
        fill={`${color}15`}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="8" r="2" fill={color} />
    </Svg>
  );
}

// 5. Leaf Icon (Teal/Green)
export function LeafIcon({ size = 16, color = "#0f766e" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 22c0 0 4-10 12-12S22 4 22 4s-6 8-8 12S2 22 2 22z"
        fill={`${color}15`}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 12c-2 2-5 3-7 4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// 6. Delivery Truck Icon (Cyan/Teal)
export function TruckIcon({ size = 16, color = "#0d9488" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Truck Cab & Flatbed */}
      <Path
        d="M2 4h12v11H2V4zm12 3h5l3 3v5h-8V7z"
        fill={`${color}15`}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wheels */}
      <Circle cx="6" cy="18" r="2" stroke={color} strokeWidth="2" fill="#0b1329" />
      <Circle cx="16" cy="18" r="2" stroke={color} strokeWidth="2" fill="#0b1329" />
      {/* Speed lines */}
      <Path d="M1 7h-2M-1 10h-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}
