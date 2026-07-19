import React, { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import Svg, { Path, Circle } from "react-native-svg";

interface AddressMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, addressName?: string) => void;
  primaryColor?: string;
}

export const AddressMapPicker: React.FC<AddressMapPickerProps> = ({
  initialLat = 11.6234,
  initialLng = 92.7265,
  onLocationSelect,
  primaryColor = "#0d9488",
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isExpanded, setIsExpanded] = useState(false);

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
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; background: #020617; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; touch-action: none; }
        #map { height: 100%; width: 100%; z-index: 1; }
        .leaflet-control-attribution { display: none !important; }
        
        .search-container {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          z-index: 1000;
        }
        .search-input-wrap {
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 6px 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          outline: none;
        }
        .search-input::placeholder {
          color: #94a3b8;
        }
        .mode-toggle {
          background: #1e293b;
          color: #ffffff;
          border: 1px solid #475569;
          font-size: 9px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          margin-left: 6px;
          white-space: nowrap;
        }
        .results-list {
          background: rgba(15, 23, 42, 0.98);
          border: 1px solid #334155;
          border-radius: 8px;
          margin-top: 4px;
          max-height: 120px;
          overflow-y: auto;
          display: none;
        }
        .result-item {
          padding: 8px 12px;
          font-size: 10px;
          color: #cbd5e1;
          border-bottom: 1px solid #1e293b;
          cursor: pointer;
        }
        .result-item:hover {
          background: ${primaryColor}33;
          color: #ffffff;
        }

        .notice-toast {
          position: absolute;
          top: 55px;
          left: 10px;
          right: 10px;
          z-index: 1000;
          background: rgba(217, 119, 6, 0.95);
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 700;
          display: none;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }

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
          box-shadow: 0 0 18px ${primaryColor};
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
      <div className="search-container">
        <div className="search-input-wrap">
          <input id="searchInput" type="text" className="search-input" placeholder="🔍 Search Port Blair landmarks..." />
          <button id="modeBtn" className="mode-toggle">🛰️ Hybrid</button>
        </div>
        <div id="resultsList" className="results-list"></div>
      </div>
      <div id="noticeToast" className="notice-toast"></div>

      <div id="map"></div>

      <script>
        var map = L.map('map', { 
          zoomControl: false,
          touchZoom: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          zoomAnimation: true,
          fadeAnimation: true,
          markerZoomAnimation: true
        }).setView([${defaultLat}, ${defaultLng}], 16);

        // Google Hybrid (Satellite + Buildings + Streets + Markings)
        var hybridTile = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
        var streetTile = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        var currentLayerType = 'y';

        var tileLayer = L.tileLayer(hybridTile, { maxZoom: 19 }).addTo(map);

        var modeBtn = document.getElementById('modeBtn');
        modeBtn.addEventListener('click', function() {
          if (currentLayerType === 'y') {
            currentLayerType = 'm';
            tileLayer.setUrl(streetTile);
            modeBtn.innerText = '🗺️ Streets';
          } else {
            currentLayerType = 'y';
            tileLayer.setUrl(hybridTile);
            modeBtn.innerText = '🛰️ Hybrid';
          }
        });

        var customIcon = L.divIcon({
          className: 'custom-pin-marker',
          html: '<div class="pin-pulse"></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        var marker = L.marker([${defaultLat}, ${defaultLng}], { icon: customIcon, draggable: true }).addTo(map);

        function sendCoords(lat, lng, name) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'COORDINATES_SELECTED', 
              lat: lat, 
              lng: lng,
              name: name || '' 
            }));
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

        // Search Autocomplete Logic
        var searchInput = document.getElementById('searchInput');
        var resultsList = document.getElementById('resultsList');
        var noticeToast = document.getElementById('noticeToast');
        var searchTimeout = null;

        searchInput.addEventListener('input', function() {
          var query = searchInput.value.trim();
          if (query.length < 2) {
            resultsList.style.display = 'none';
            return;
          }
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(function() {
            fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query + ', Port Blair, Andaman') + '&viewbox=92.0,14.0,94.0,6.0&bounded=0')
              .then(function(r) { return r.json(); })
              .then(function(data) {
                resultsList.innerHTML = '';
                if (data && data.length > 0) {
                  resultsList.style.display = 'block';
                  data.slice(0, 4).forEach(function(item) {
                    var div = document.createElement('div');
                    div.className = 'result-item';
                    div.innerText = item.display_name;
                    div.addEventListener('click', function() {
                      var lat = parseFloat(item.lat);
                      var lon = parseFloat(item.lon);
                      map.setView([lat, lon], 17);
                      marker.setLatLng([lat, lon]);
                      sendCoords(lat, lon, item.display_name);
                      resultsList.style.display = 'none';
                      searchInput.value = item.display_name.split(',')[0];
                    });
                    resultsList.appendChild(div);
                  });
                } else {
                  resultsList.style.display = 'none';
                }
              })
              .catch(function() {});
          }, 400);
        });

        function showNotice(msg) {
          noticeToast.innerText = msg;
          noticeToast.style.display = 'block';
          setTimeout(function() { noticeToast.style.display = 'none'; }, 4000);
        }

        window.zoomInMap = function() {
          map.zoomIn({ animate: true });
        };

        window.zoomOutMap = function() {
          map.zoomOut({ animate: true });
        };

        window.locateMe = function() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              var lat = position.coords.latitude;
              var lng = position.coords.longitude;
              var isAndaman = lat >= 6.0 && lat <= 14.0 && lng >= 92.0 && lng <= 94.0;
              if (!isAndaman) {
                showNotice("📍 GPS outside Andaman. Map pin centered on Port Blair.");
                lat = 11.6234;
                lng = 92.7265;
              }
              map.setView([lat, lng], 17);
              marker.setLatLng([lat, lng]);
              sendCoords(lat, lng);
            }, function(err) {
              showNotice("📍 Satellite location centered on Port Blair.");
              map.setView([11.6234, 92.7265], 17);
              marker.setLatLng([11.6234, 92.7265]);
              sendCoords(11.6234, 92.7265);
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
        onLocationSelect(
          Number(data.lat.toFixed(6)),
          Number(data.lng.toFixed(6)),
          data.name
        );
      }
    } catch {
      // Ignore parse errors
    }
  };

  const handleLocateMe = () => {
    webViewRef.current?.injectJavaScript(`if(window.locateMe) window.locateMe(); true;`);
  };

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript(`if(window.zoomInMap) window.zoomInMap(); true;`);
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript(`if(window.zoomOutMap) window.zoomOutMap(); true;`);
  };

  return (
    <View style={[styles.container, isExpanded && styles.containerExpanded]}>
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
      
      {/* Map Control Bar (Enlarge/Minimize, Zoom, GPS) */}
      <View style={styles.controlsBar}>
        <Pressable onPress={() => setIsExpanded(!isExpanded)} style={styles.controlBtn}>
          <Text style={styles.controlText}>{isExpanded ? "⤡ MINIMIZE" : "⤢ ENLARGE"}</Text>
        </Pressable>

        <View style={styles.zoomGroup}>
          <Pressable onPress={handleZoomIn} style={styles.iconBtn}>
            <Text style={styles.iconText}>＋</Text>
          </Pressable>
          <Pressable onPress={handleZoomOut} style={styles.iconBtn}>
            <Text style={styles.iconText}>－</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleLocateMe} style={styles.locateBtn}>
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="10" />
            <Circle cx="12" cy="12" r="3" />
            <Path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
          </Svg>
          <Text style={styles.locateText}>GPS LOCATE</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
    transitionProperty: "height",
    transitionDuration: "300ms",
  },
  containerExpanded: {
    height: 480,
  },
  webview: {
    flex: 1,
    backgroundColor: "#020617",
  },
  controlsBar: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 100,
  },
  controlBtn: {
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    borderWidth: 1,
    borderColor: "#475569",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  controlText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  zoomGroup: {
    flexDirection: "row",
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#475569",
    overflow: "hidden",
  },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  locateBtn: {
    backgroundColor: "#0d9488",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
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
