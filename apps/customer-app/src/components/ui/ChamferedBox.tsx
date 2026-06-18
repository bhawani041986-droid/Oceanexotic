import React, { useState } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { cn } from '@/lib/utils';

export interface ChamferedBoxProps extends ViewProps {
 fillColor?: string;
 strokeColor?: string;
 strokeWidth?: number;
 bevelSize?: number;
}

export function ChamferedBox({
 fillColor ="rgba(2, 6, 23, 0.4)",
 strokeColor ="rgba(255, 255, 255, 0.15)",
 strokeWidth = 1,
 bevelSize = 14,
 children,
 className,
 style,
 ...props
}: ChamferedBoxProps) {
 const [layout, setLayout] = useState({ width: 0, height: 0 });
 const w = layout.width;
 const h = layout.height;
 const b = bevelSize;

 // The path starts at top-left (shifted right by bevel), goes to top-right,
 // down to bottom-right (shifted up by bevel), left to bottom-left, up to top-left.
 const pathD = w > 0 && h > 0 
 ? `M${b},0 L${w},0 L${w},${h - b} L${w - b},${h} L0,${h} L0,${b} Z` 
 :"";

 return (
 <View
 onLayout={(e) => setLayout(e.nativeEvent.layout)}
 className={cn("relative overflow-hidden", className)}
 style={style}
 {...props}
 >
 {/* Background and Border layer */}
 {w > 0 && h > 0 ? (
 <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
 <Path
 d={pathD}
 fill={fillColor}
 stroke={strokeColor}
 strokeWidth={strokeWidth}
 />
 </Svg>
 ) : null}
 
 {/* Content layer */}
 <View className="relative z-10 w-full h-full">
 {children}
 </View>
 </View>
 );
}
