import { TextInput, TextInputProps, View, Text } from "react-native";
import { cn } from "@/lib/utils";

export interface InputProps extends TextInputProps {
  error?: string;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <View>
      <TextInput
        className={cn(
          "h-12 w-full rounded-[14px] border border-white/10 bg-card px-4 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          error && "border-danger/50",
          className
        )}
        placeholderTextColor="#94A3B8"
        {...props}
      />
      {error ? (
        <Text className="mt-1 ml-1 text-[10px] font-bold text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
