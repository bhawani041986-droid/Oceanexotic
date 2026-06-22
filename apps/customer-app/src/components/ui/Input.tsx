import { useState } from "react";
import { TextInput, TextInputProps, View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import Svg, { Path, Circle, Line, Polygon } from "react-native-svg";

export interface InputProps extends TextInputProps {
  error?: string;
  isPassword?: boolean;
}

export function Input({ className, error, isPassword, secureTextEntry, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View>
      <View className="relative flex-row items-center w-full">
        <TextInput
          className={cn(
            "h-12 w-full rounded-none border-l-4 border-l-indigo-500/50 border border-white/10 bg-card text-sm text-foreground",
            isPassword ? "pl-4 pr-12" : "px-4",
            "placeholder:text-muted-foreground",
            error && "border-danger/50",
            className
          )}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isSecure}
          {...props}
        />
        {/* Cut-corner overlays for Input */}
        <Svg width={8} height={8} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
          <Polygon points="0,0 8,0 0,8" fill="#020817" />
        </Svg>
        <Svg width={8} height={8} style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 10 }}>
          <Polygon points="8,8 0,8 8,0" fill="#020817" />
        </Svg>
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: 14, height: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            {showPassword ? (
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <Path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <Path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <Line x1="2" y1="2" x2="22" y2="22" />
              </Svg>
            ) : (
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <Circle cx="12" cy="12" r="3" />
              </Svg>
            )}
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="mt-1 ml-1 text-[10px] font-bold text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
