import React, { useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import Svg, { Path, Circle } from "react-native-svg";

interface AddressMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  primaryColor?: string;
}

export const AddressMapPicker: React.FC<AddressMapPickerProps> = ({
  initialLat = 11.6234,
  initialLng = 92.7265,
  onLocationSelect,
  primaryColor = "#0d9488",
}) => {
  const webViewRef = useRef<WebView>(null);

  const defaultLat = initialLat || 11.6234;
  const defaultLng = initialLng || 92.7265;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; background: #0f172a; overflow: hidden; }
        #map { height: 100%; width: 100%; }
        .leaflet-control-attribution { display: none !important; }
        .custom-pin-marker {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pin-pulse {
          width: 32px;
          height: 32px;
          background: ${primaryColor};
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 15px ${primaryColor}99;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 ${primaryColor}aa; }
          70% { transform: scale(1.1); box-shadow: 0 0 0 12px rgba(13, 148, 136, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${defaultLat}, ${defaultLng}], 15);

        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 19
        }).addTo(map);

        var customIcon = L.divIcon({
          className: 'custom-pin-marker',
          html: '<div class="pin-pulse"></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        var marker = L.marker([${defaultLat}, ${defaultLng}], { icon: customIcon, draggable: true }).addTo(map);

        function sendCoords(lat, lng) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'COORDINATES_SELECTED', lat: lat, lng: lng }));
          }
        }

        // Emit initial location
        sendCoords(${defaultLat}, ${defaultLng});

        marker.on('dragend', function (e) {
          var latlng = marker.getLatLng();
          sendCoords(latlng.lat, latlng.lng);
        });

        map.on('click', function (e) {
          marker.setLatLng(e.latlng);
          sendCoords(e.latlng.lat, e.latlng.lng);
        });

        window.locateMe = function() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              var lat = position.coords.latitude;
              var lng = position.coords.longitude;
              map.setView([lat, lng], 17);
              marker.setLatLng([lat, lng]);
              sendCoords(lat, lng);
            }, function(err) {
              console.warn("Geolocation error:", err.message);
            }, { enableHighAccuracy: true });
          }
        };
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "COORDINATES_SELECTED" && data.lat && data.lng) {
        onLocationSelect(Number(data.lat.toFixed(6)), Number(data.lng.toFixed(6)));
      }
    } catch {
      // Ignore parse errors
    }
  };

  const handleLocateMe = () => {
    webViewRef.current?.injectJavaScript(`if(window.locateMe) window.locateMe(); true;`);
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
      />
      <Pressable onPress={handleLocateMe} style={styles.locateBtn}>
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="12" cy="12" r="10" />
          <Circle cx="12" cy="12" r="3" />
          <Path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </Svg>
        <Text style={styles.locateText}>GPS LOCATE ME</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  webview: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  locateBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#0d9488",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  locateText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
