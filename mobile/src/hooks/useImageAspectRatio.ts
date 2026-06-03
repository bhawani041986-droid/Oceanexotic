import { useState, useEffect, useCallback } from "react";
import { Image as RNImage } from "react-native";

/**
 * Hook to retrieve the natural aspect ratio of a remote or local image URL dynamically.
 * Combines pre-fetch getSize and dynamic onLoad event handlers to bypass web CORS limitations.
 */
export function useImageAspectRatio(uri: string, defaultRatio: number = 4 / 3) {
  const [aspectRatio, setAspectRatio] = useState<number>(defaultRatio);

  useEffect(() => {
    if (!uri) {
      setAspectRatio(defaultRatio);
      return;
    }

    if (uri.startsWith("http://") || uri.startsWith("https://") || uri.startsWith("file://")) {
      RNImage.getSize(
        uri,
        (width, height) => {
          if (width && height && height > 0) {
            setAspectRatio(width / height);
          }
        },
        () => {
          // Silent fallback — onLoad handler will resolve on load completion
        }
      );
    }
  }, [uri, defaultRatio]);

  const onLoad = useCallback((event: any) => {
    const source = event?.source || event?.nativeEvent?.source;
    if (source && source.width && source.height && source.height > 0) {
      setAspectRatio(source.width / source.height);
    }
  }, []);

  return { aspectRatio, onLoad };
}
