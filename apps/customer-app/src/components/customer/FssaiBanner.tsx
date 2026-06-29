import React from "react";
import { View, Dimensions } from "react-native";
import { Image } from "expo-image";

const IMG_FSSAI_BANNER = require("../../../assets/fssai_banner.jpg");

export function FssaiBanner() {
  const { width } = Dimensions.get("window");
  const fssaiWidth = width - 32;
  const fssaiHeight = fssaiWidth / 3.003;

  return (
    <View 
      className="mx-4 relative overflow-hidden" 
      style={{ 
        width: fssaiWidth, 
        height: fssaiHeight, 
        marginTop: 4, 
        marginBottom: 16,
        alignSelf: "center"
      }}
    >
      <Image
        source={IMG_FSSAI_BANNER}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
      />
    </View>
  );
}
