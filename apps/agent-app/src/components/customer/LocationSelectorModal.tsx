import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FULL_API_URL } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectHub: (hub: any) => void;
  colors: any;
}

export function LocationSelectorModal({ visible, onClose, onSelectHub, colors }: LocationSelectorModalProps) {
  const [loading, setLoading] = useState(false);
  const [territories, setTerritories] = useState<any[]>([]);
  const [step, setStep] = useState(1);

  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      fetchTerritories();
    }
  }, [visible]);

  const fetchTerritories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${FULL_API_URL}/system/get_territories`);
      const data = await res.json();
      setTerritories(data || []);
    } catch (e) {
      console.warn('Failed to fetch territories', e);
    } finally {
      setLoading(false);
    }
  };

  const getChildren = (parentId: number | null, type: string) => {
    return territories.filter((t) => t.parent_id == parentId && t.zone_type === type);
  };

  const getDeliveryZonesUnderHub = (hubId: number) => {
    return territories.filter((t) => t.parent_id === hubId && t.zone_type === 'DELIVERY_ZONE');
  };

  const countries = territories.filter((t) => t.zone_type === 'COUNTRY');
  const states = selectedCountry ? getChildren(selectedCountry.id, 'STATE_PROVINCE') : [];
  const districts = selectedState ? getChildren(selectedState.id, 'DISTRICT') : [];
  const cities = selectedDistrict ? getChildren(selectedDistrict.id, 'CITY_ISLAND') : [];
  const hubs = selectedCity ? getChildren(selectedCity.id, 'ADMIN_HUB') : [];

  // At step 5, show the hub itself + all its DELIVERY_ZONE children as selectable areas
  const hubsAndZones = hubs.flatMap((hub: any) => {
    const zones = getDeliveryZonesUnderHub(hub.id);
    // If the hub has delivery zones, show them. If not, show the hub itself directly.
    return zones.length > 0 ? zones.map((z: any) => ({ ...z, _hubName: hub.name })) : [hub];
  });

  const handleSelect = (item: any, type: string) => {
    setSearchQuery('');
    if (type === 'COUNTRY') {
      setSelectedCountry(item);
      setStep(2);
    } else if (type === 'STATE_PROVINCE') {
      setSelectedState(item);
      setStep(3);
    } else if (type === 'DISTRICT') {
      setSelectedDistrict(item);
      setStep(4);
    } else if (type === 'CITY_ISLAND') {
      setSelectedCity(item);
      setStep(5);
    } else if (type === 'ADMIN_HUB' || type === 'DELIVERY_ZONE') {
      // Save selected area/hub to AsyncStorage
      AsyncStorage.setItem('ocean_active_hub', JSON.stringify({
        id: item.id,
        name: item.name,
        type: item.zone_type,
      }));
      onSelectHub(item);
      onClose();
    }
  };

  const getListToRender = () => {
    let list: any[] = [];
    if (step === 1) list = countries;
    else if (step === 2) list = states;
    else if (step === 3) list = districts;
    else if (step === 4) list = cities;
    else if (step === 5) list = hubsAndZones;

    if (searchQuery) {
      return list.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  };

  const getStepTitle = () => {
    if (step === 1) return 'Select Country';
    if (step === 2) return `State / Province in ${selectedCountry?.name}`;
    if (step === 3) return `District in ${selectedState?.name}`;
    if (step === 4) return `City in ${selectedDistrict?.name}`;
    if (step === 5) return `Choose your delivery area in ${selectedCity?.name}`;
    return '';
  };

  // Shortcuts for the 4 known delivery areas — let user skip directly
  const QUICK_AREAS = ['Atamphad', 'Bhatubasti', 'Dollygunj', 'Minibay'];

  const handleQuickPick = (areaName: string) => {
    // Find this area in territories if it exists, else create a stub
    const match = territories.find((t) =>
      t.name.toLowerCase() === areaName.toLowerCase() &&
      (t.zone_type === 'DELIVERY_ZONE' || t.zone_type === 'ADMIN_HUB')
    );
    const item = match ?? { id: areaName, name: areaName, zone_type: 'DELIVERY_ZONE' };
    AsyncStorage.setItem('ocean_active_hub', JSON.stringify({ id: item.id, name: item.name }));
    onSelectHub(item);
    onClose();
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setSearchQuery('');
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View 
          className="h-[80%] rounded-t-3xl p-5"
          style={{ backgroundColor: colors.card, borderTopWidth: 1, borderColor: colors.border }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={handleBack} className="p-2 -ml-2 rounded-full active:bg-black/5">
              <MaterialCommunityIcons name={step === 1 ? 'close' : 'arrow-left'} size={24} color={colors.text} />
            </Pressable>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              {getStepTitle()}
            </Text>
            <View className="w-10" />
          </View>
          {/* Quick Pick — always visible shortcut to the 4 delivery areas */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              We deliver to these areas:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {QUICK_AREAS.map((area) => (
                <Pressable
                  key={area}
                  onPress={() => handleQuickPick(area)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 7,
                    borderRadius: 20, borderWidth: 1.5,
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + '15',
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                  }}
                >
                  <Text style={{ fontSize: 12 }}>🚚</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{area}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 }}>or browse locations</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          {step > 1 && (
            <View className="flex-row flex-wrap mb-4 gap-1 px-1">
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>{selectedCountry?.name}</Text>
              {step > 2 && <Text style={{ color: colors.textMuted, fontSize: 12 }}>›</Text>}
              {step > 2 && <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>{selectedState?.name}</Text>}
              {step > 3 && <Text style={{ color: colors.textMuted, fontSize: 12 }}>›</Text>}
              {step > 3 && <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>{selectedDistrict?.name}</Text>}
              {step > 4 && <Text style={{ color: colors.textMuted, fontSize: 12 }}>›</Text>}
              {step > 4 && <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>{selectedCity?.name}</Text>}
            </View>
          )}

          {/* Search */}
          <View 
            className="flex-row items-center h-12 rounded-xl px-4 mb-4 border"
            style={{ backgroundColor: colors.bg, borderColor: colors.border }}
          >
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
            <TextInput 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search..."
              placeholderTextColor={colors.textMuted}
              className="flex-1 ml-2 text-base h-full"
              style={{ color: colors.text }}
            />
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {getListToRender().map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelect(item, item.zone_type)}
                  className="flex-row items-center justify-between p-4 border-b active:opacity-70"
                  style={{ borderBottomColor: colors.border }}
                >
                  <Text className="text-base font-semibold" style={{ color: colors.text }}>{item.name}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                </Pressable>
              ))}
              {getListToRender().length === 0 && !loading && (
                <View className="py-10 items-center">
                  <MaterialCommunityIcons name="map-marker-off" size={48} color={colors.textMuted} style={{ opacity: 0.5 }} />
                  <Text className="mt-4 text-sm font-semibold" style={{ color: colors.textMuted }}>No locations found</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
