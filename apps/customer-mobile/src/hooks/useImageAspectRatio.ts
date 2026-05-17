import { useState, useEffect } from "react";
import { Image as RNImage } from "react-native";

/**
 * Hook to retrieve the natural aspect ratio of a remote or local image URL dynamically.
 * Helps render images in their exact natural proportions without letterboxing or cropping.
 */
export function useImageAspectRatio(uri: string, defaultRatio: number = 4 / 3) {
  const [aspectRatio, setAspectRatio] = useState<number>(defaultRatio);

  useEffect(() => {
    if (!uri) return;

    // Only query dimensions for valid web/local URIs to prevent react-native crashes
    if (uri.startsWith("http://") || uri.startsWith("https://") || uri.startsWith("file://")) {
      RNImage.getSize(
        uri,
        (width, height) => {
          if (width && height && height > 0) {
            // Apply sanity bounds to prevent extremely long or wide aspect ratios from breaking cards
            const ratio = width / height;
            const boundedRatio = Math.max(0.6, Math.min(2.0, ratio));
            setAspectRatio(boundedRatio);
          }
        },
        (error) => {
          console.warn("[useImageAspectRatio] getSize failed, reverting to fallback:", error);
        }
      );
    }
  }, [uri, defaultRatio]);

  return aspectRatio;
}
