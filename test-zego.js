const { ZegoUIKitPrebuilt } = require('@zegocloud/zego-uikit-prebuilt');

try {
  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
    1965621224,
    "c441055133b191867d11992d5c04412b",
    "ROOM_1_123456789",
    "FLEET-8",
    "Delivery Agent"
  );
  console.log("Token generated successfully:", kitToken.substring(0, 50) + "...");
} catch (e) {
  console.error("Failed to generate token:", e);
}
