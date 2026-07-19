import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Haversine formula — distance in km between two GPS points
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Serviceable areas helper: finds parent hub name for a zone
function findHubName(zone: any, allNodes: any[]): string {
  const territory = allNodes.find((n: any) => n.id === zone.parent_id);
  if (!territory) return 'Dollygunj Hub';
  const hub = allNodes.find((n: any) => n.id === territory.parent_id);
  return hub ? hub.name : 'Dollygunj Hub';
}

// Ray-Casting algorithm for point-in-polygon check
function isPointInPolygon(lat: number, lng: number, polygonStr: string): boolean {
  const matches = polygonStr.match(/\(\((.*?)\)\)/);
  if (!matches || !matches[1]) return false;
  
  const points = matches[1].split(',').map(ptStr => {
    const [pLat, pLng] = ptStr.trim().split(/\s+/).map(Number);
    return [pLat, pLng];
  }).filter(pt => !isNaN(pt[0]) && !isNaN(pt[1]));

  if (points.length < 3) return false;

  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0], yi = points[i][1];
    const xj = points[j][0], yj = points[j][1];

    const intersect = ((yi > lng) !== (yj > lng))
        && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const areaQuery = (searchParams.get('area') || '').toLowerCase().trim();

    // Fetch hub settings from Supabase
    const { data: settings } = await supabase
      .from('marketplace_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['hub_lat', 'hub_lng', 'service_radius_km',
                          'delivery_available_message', 'delivery_unavailable_message']);

    const settingsMap: Record<string, string> = {};
    (settings || []).forEach((s: any) => { settingsMap[s.setting_key] = s.setting_value; });

    const hubLat = parseFloat(settingsMap['hub_lat'] || '11.63501701727013');
    const hubLng = parseFloat(settingsMap['hub_lng'] || '92.70794213208694');
    const radiusKm = parseFloat(settingsMap['service_radius_km'] || '8');
    const availableMsg = settingsMap['delivery_available_message'] || 'Delivery available in your area!';
    const unavailableMsg = settingsMap['delivery_unavailable_message'] || 'Coming soon to your area. Register for updates.';

    // Fetch active nodes from Supabase
    const { data: dbNodes, error: dbError } = await supabase
      .from('maritime_territories')
      .select('*')
      .eq('status', 'ACTIVE');

    if (dbError) throw dbError;

    const allNodes = dbNodes || [];
    const activeHubs = allNodes.filter((n: any) => n.zone_type === 'ADMIN_HUB');
    const activeZones = allNodes.filter((n: any) => n.zone_type === 'DELIVERY_ZONE');

    // ── Check by GPS coordinates ──────────────────────
    if (!isNaN(lat) && !isNaN(lng)) {
      let matchedZone: any = null;
      let matchedZonePolygon = false;

      // Check if location falls inside any active geofenced polygon boundary
      for (const zone of activeZones) {
        if (zone.coordinates && zone.coordinates.includes('POLYGON')) {
          if (isPointInPolygon(lat, lng, zone.coordinates)) {
            matchedZone = zone;
            matchedZonePolygon = true;
            break;
          }
        }
      }

      if (matchedZonePolygon && matchedZone) {
        let delivery_charge = 0;
        let minimum_order = 0;
        let eta_mins = 45;
        let allowed_slots: string[] = [];
        let custom_slots: Record<string, string> = {};

        const parts = matchedZone.coordinates.split(',').map((p: string) => p.trim());
        delivery_charge = parseFloat(parts[0]) || 0;
        minimum_order = parseFloat(parts[1]) || 0;
        eta_mins = parseInt(parts[2]) || 45;
        if (parts[3]) {
          allowed_slots = parts[3].split('|').map((s: string) => s.trim()).filter(Boolean);
        }
        if (parts[4]) {
          parts[4].split('|').forEach((pair: string) => {
            const [key, val] = pair.split(':').map((s: string) => s.trim());
            if (key && val) {
              custom_slots[key] = val;
            }
          });
        }

        const hubName = findHubName(matchedZone, allNodes);
        return NextResponse.json({
          deliverable: true,
          method: 'gps_polygon',
          distanceKm: null,
          estimatedMinutes: eta_mins,
          delivery_charge,
          minimum_order,
          allowed_slots: allowed_slots.length > 0 ? allowed_slots : ['TODAY_AM', 'TODAY_PM', 'TOMORROW'],
          custom_slots,
          message: availableMsg,
          hubName,
        });
      }

      // If at least one active polygon is drawn in the database, enforce strict boundary check!
      const anyPolygonConfigured = activeZones.some(z => z.coordinates && z.coordinates.includes('POLYGON'));
      if (anyPolygonConfigured) {
        return NextResponse.json({
          deliverable: false,
          method: 'gps_polygon',
          message: unavailableMsg,
          hubName: 'Dollygunj Hub',
        });
      }

      // Fallback: If no polygons exist in the DB, calculate distance from active hubs
      let closestHub: any = null;
      let minDistance = Infinity;

      activeHubs.forEach((hub: any) => {
        if (hub.coordinates) {
          const [hLat, hLng] = hub.coordinates.split(',').map((c: string) => parseFloat(c.trim()));
          if (!isNaN(hLat) && !isNaN(hLng)) {
            const dist = haversineKm(lat, lng, hLat, hLng);
            if (dist < minDistance) {
              minDistance = dist;
              closestHub = hub;
            }
          }
        }
      });

      if (!closestHub) {
        minDistance = haversineKm(lat, lng, hubLat, hubLng);
      }

      const deliverable = minDistance <= radiusKm && activeHubs.length > 0;
      const estimatedMinutes = deliverable ? Math.round(10 + (minDistance / radiusKm) * 50) : null;

      return NextResponse.json({
        deliverable,
        method: 'gps',
        distanceKm: Math.round(minDistance * 10) / 10,
        radiusKm,
        estimatedMinutes,
        message: deliverable ? availableMsg : unavailableMsg,
        hubName: closestHub ? closestHub.name : 'Dollygunj Hub',
      });
    }

    // ── Check by area name ────────────────────────────
    if (areaQuery) {
      const matchedZone = activeZones.find(
        (zone: any) => areaQuery.includes(zone.name.toLowerCase()) || zone.name.toLowerCase().includes(areaQuery)
      );
      
      const matched = !!matchedZone;
      const hubName = matchedZone ? findHubName(matchedZone, allNodes) : 'Dollygunj Hub';

      let delivery_charge = 0;
      let minimum_order = 0;
      let eta_mins = 45;
      let allowed_slots: string[] = [];
      let custom_slots: Record<string, string> = {};

      if (matchedZone) {
        if (matchedZone.delivery_charge !== undefined && matchedZone.delivery_charge !== null) {
          delivery_charge = parseFloat(matchedZone.delivery_charge) || 0;
          minimum_order = parseFloat(matchedZone.minimum_order) || 0;
          eta_mins = parseInt(matchedZone.eta_mins) || 45;
        } else if (matchedZone.coordinates) {
          const parts = matchedZone.coordinates.split(',').map((p: string) => p.trim());
          delivery_charge = parseFloat(parts[0]) || 0;
          minimum_order = parseFloat(parts[1]) || 0;
          eta_mins = parseInt(parts[2]) || 45;
          if (parts[3]) {
            allowed_slots = parts[3].split('|').map((s: string) => s.trim()).filter(Boolean);
          }
          if (parts[4]) {
            parts[4].split('|').forEach((pair: string) => {
              const [key, val] = pair.split(':').map((s: string) => s.trim());
              if (key && val) {
                custom_slots[key] = val;
              }
            });
          }
        }
      }

      return NextResponse.json({
        deliverable: matched,
        method: 'area_name',
        distanceKm: null,
        estimatedMinutes: eta_mins,
        delivery_charge,
        minimum_order,
        allowed_slots: allowed_slots.length > 0 ? allowed_slots : ['TODAY_AM', 'TODAY_PM', 'TOMORROW'],
        custom_slots,
        message: matched ? availableMsg : unavailableMsg,
        hubName,
        areaQueried: areaQuery,
      });
    }

    return NextResponse.json(
      { status: 'error', message: 'Provide lat+lng or area query parameter' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Service area check error:', err);
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    );
  }
}
