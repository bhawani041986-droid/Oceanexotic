import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import type { CutOption, TodaysCatchItem } from "@/services/homeService";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CutSelectionModalProps {
  visible: boolean;
  product: TodaysCatchItem | null;
  options: CutOption[];
  selected: CutOption | null;
  loading: boolean;
  onSelect: (cut: CutOption) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function CutSelectionModal({
  visible,
  product,
  options,
  selected,
  loading,
  onSelect,
  onClose,
  onConfirm,
}: CutSelectionModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/70">
        <View className="max-h-[80%] rounded-t-3xl border border-white/10 bg-card p-6">
          <Text className="text-lg font-black uppercase italic text-foreground">
            Select Cut — {product?.name}
          </Text>
          <Text className="mt-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Whole • Curry • Steak • Fillet • Cleaned options
          </Text>

          {loading ? (
            <ActivityIndicator className="my-8" color="#7C3AED" />
          ) : (
            <ScrollView className="mt-4 max-h-64">
              {options.map((cut) => (
                <Pressable
                  key={cut.cut_type}
                  onPress={() => onSelect(cut)}
                  className={cn(
                    "mb-2 flex-row items-center justify-between rounded-xl border px-4 py-3",
                    selected?.cut_type === cut.cut_type
                      ? "border-primary bg-primary/20"
                      : "border-white/10 bg-background/50"
                  )}
                >
                  <Text className="text-sm font-bold uppercase text-foreground">{cut.label}</Text>
                  <Text className="text-sm font-black italic text-primary">₹{cut.final_price}</Text>
                </Pressable>
              ))}
              {options.length === 0 ? (
                <Text className="py-6 text-center text-xs text-muted-foreground">
                  No cut options in registry for this harvest.
                </Text>
              ) : null}
            </ScrollView>
          )}

          <View className="mt-4 flex-row gap-3">
            <Button label="CANCEL" variant="ghost" onPress={onClose} className="flex-1" />
            <Button
              label="ADD TO CART"
              onPress={onConfirm}
              disabled={!selected || loading}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
