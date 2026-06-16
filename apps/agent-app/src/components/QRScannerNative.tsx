import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const SCAN_BOX_SIZE = Math.min(SCREEN_W, SCREEN_H) * 0.65;

interface QRScannerNativeProps {
  isOpen: boolean;
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRScannerNative({ isOpen, onScan, onClose }: QRScannerNativeProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const cornerAnim = useRef(new Animated.Value(0)).current;

  // Scanning line sweep animation
  useEffect(() => {
    if (!isOpen) return;
    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(sweepAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(sweepAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    const corner = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(cornerAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
      ])
    );
    sweep.start();
    corner.start();
    return () => { sweep.stop(); corner.stop(); };
  }, [isOpen]);

  // Reset scanned state when modal opens
  useEffect(() => {
    if (isOpen) setScanned(false);
  }, [isOpen]);

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
  };

  const sweepTranslateY = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_BOX_SIZE - 4],
  });

  const cornerOpacity = cornerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  if (!isOpen) return null;

  // ── Permission not yet determined ──────────────────────────────────────────
  if (!permission) {
    return (
      <Modal visible={isOpen} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.loadingText}>Initializing camera...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  // ── Permission denied ──────────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.emoji}>📵</Text>
            <Text style={styles.title}>Camera Permission Required</Text>
            <Text style={styles.subtitle}>
              OceanExotic Agent needs camera access to scan customer QR codes for delivery confirmation.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={requestPermission}>
              <Text style={styles.primaryBtnText}>GRANT CAMERA ACCESS</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={onClose}>
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  // ── Camera active ──────────────────────────────────────────────────────────
  return (
    <Modal visible={isOpen} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.fullScreen}>
        {/* Camera Feed */}
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />

        {/* Dark overlay with scan cutout */}
        <View style={styles.scanOverlay}>
          {/* Top dark area */}
          <View style={styles.overlayTop} />

          {/* Middle row: dark | scan box | dark */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />

            {/* The scan box */}
            <View style={[styles.scanBox, { width: SCAN_BOX_SIZE, height: SCAN_BOX_SIZE }]}>

              {/* Corner markers */}
              <Animated.View style={[styles.corner, styles.cornerTL, { opacity: cornerOpacity }]} />
              <Animated.View style={[styles.corner, styles.cornerTR, { opacity: cornerOpacity }]} />
              <Animated.View style={[styles.corner, styles.cornerBL, { opacity: cornerOpacity }]} />
              <Animated.View style={[styles.corner, styles.cornerBR, { opacity: cornerOpacity }]} />

              {/* Scanning sweep line */}
              <Animated.View
                style={[
                  styles.sweepLine,
                  { transform: [{ translateY: sweepTranslateY }] },
                ]}
              />
            </View>

            <View style={styles.overlaySide} />
          </View>

          {/* Bottom dark area with instructions */}
          <View style={styles.overlayBottom}>
            <Text style={styles.instructionText}>
              📷 Point camera at customer's QR code
            </Text>
            <Text style={styles.subInstructionText}>
              Ask customer to show QR from their order page
            </Text>

            {scanned && (
              <View style={styles.successBadge}>
                <Text style={styles.successText}>✅ QR Detected! Processing...</Text>
              </View>
            )}

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕  Cancel Scan</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#0A0F1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 16,
    borderTopWidth: 1,
    borderColor: "#1E293B",
  },
  emoji: { fontSize: 48 },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  loadingText: { color: "#64748B", fontSize: 12 },
  primaryBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: "center",
    width: "100%",
  },
  secondaryBtnText: { color: "#64748B", fontSize: 12 },
  fullScreen: { flex: 1, backgroundColor: "#000" },
  scanOverlay: { ...StyleSheet.absoluteFillObject, flexDirection: "column" },
  overlayTop: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)" },
  overlayMiddle: { flexDirection: "row" },
  overlaySide: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)" },
  scanBox: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  overlayBottom: {
    flex: 1.2,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subInstructionText: {
    color: "#64748B",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  successBadge: {
    backgroundColor: "#10B98133",
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  successText: { color: "#10B981", fontSize: 12, fontWeight: "700" },
  closeBtn: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  closeBtnText: { color: "#94A3B8", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },

  // Corner markers
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#10B981",
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },

  // Sweep line
  sweepLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
});
