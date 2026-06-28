import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo-vector-icons';
import api from '../../services/api';

// Pre-populated countries for standard e-commerce selection
const GLOBAL_COUNTRIES = [
  { name: 'India', code: 'IN' },
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'UK' },
  { name: 'Australia', code: 'AU' },
  { name: 'Canada', code: 'CA' },
  { name: 'Singapore', code: 'SG' },
  { name: 'United Arab Emirates', code: 'AE' }
];

export default function TerritoriesConfigScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Selections
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);

  // DB Lists
  const [dbCountries, setDbCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);

  // Form inputs
  const [customInput, setCustomInput] = useState('');
  const [hubLat, setHubLat] = useState('');
  const [hubLng, setHubLng] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  useEffect(() => {
    fetchLocations('countries', null);
  }, []);

  const fetchLocations = async (type: string, parentId: number | null) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/logistics/locations.php?type=${type}${parentId ? `&parent_id=${parentId}` : ''}`);
      if (res.data.status === 'success') {
        if (type === 'countries') setDbCountries(res.data.data);
        if (type === 'states') setStates(res.data.data);
        if (type === 'districts') setDistricts(res.data.data);
        if (type === 'cities') setCities(res.data.data);
        if (type === 'hubs') setHubs(res.data.data);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (type: string, name: string, parentId: number | null, extra: any = {}) => {
    try {
      setLoading(true);
      const payload = { type, name, parent_id: parentId, ...extra };
      const res = await api.post('/admin/logistics/locations.php', payload);
      if (res.data.status === 'success') {
        return { id: res.data.id, name };
      }
      throw new Error(res.data.message);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', `Failed to create ${type}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = async (countryName: string, countryCode: string) => {
    setShowCountryPicker(false);
    let existing = dbCountries.find(c => c.name.toLowerCase() === countryName.toLowerCase());
    if (!existing) {
      existing = await handleCreateLocation('country', countryName, null, { code: countryCode });
      if (existing) {
        setDbCountries([...dbCountries, existing]);
      }
    }
    if (existing) {
      setSelectedCountry(existing);
      setStep(2);
      fetchLocations('states', existing.id);
    }
  };

  const handleAddState = async () => {
    if (!customInput) return;
    const added = await handleCreateLocation('state', customInput, selectedCountry.id);
    if (added) {
      setSelectedState(added);
      setCustomInput('');
      setStep(3);
      fetchLocations('districts', added.id);
    }
  };

  const handleAddDistrict = async () => {
    if (!customInput) return;
    const added = await handleCreateLocation('district', customInput, selectedState.id);
    if (added) {
      setSelectedDistrict(added);
      setCustomInput('');
      setStep(4);
      fetchLocations('cities', added.id);
    }
  };

  const handleAddCity = async () => {
    if (!customInput) return;
    const added = await handleCreateLocation('city', customInput, selectedDistrict.id);
    if (added) {
      setSelectedCity(added);
      setCustomInput('');
      setStep(5);
      fetchLocations('hubs', added.id);
    }
  };

  const handleAddHub = async () => {
    if (!customInput || !hubLat || !hubLng) return Alert.alert('Error', 'Name and coordinates required');
    const added = await handleCreateLocation('hub', customInput, selectedCity.id, {
      latitude: parseFloat(hubLat),
      longitude: parseFloat(hubLng)
    });
    if (added) {
      Alert.alert('Success', 'Delivery Hub created & geo-tagged successfully!');
      setCustomInput('');
      setHubLat('');
      setHubLng('');
      fetchLocations('hubs', selectedCity.id);
    }
  };

  const renderBreadcrumbs = () => (
    <View className="flex-row items-center flex-wrap mb-6 bg-white p-4 rounded-xl border border-slate-200">
      <TouchableOpacity onPress={() => setStep(1)}><Text className={`${step === 1 ? 'font-bold text-primary' : 'text-slate-500'}`}>🌍 World</Text></TouchableOpacity>
      {selectedCountry && <><Text className="mx-2 text-slate-300">/</Text><TouchableOpacity onPress={() => setStep(2)}><Text className={`${step === 2 ? 'font-bold text-primary' : 'text-slate-500'}`}>{selectedCountry.name}</Text></TouchableOpacity></>}
      {selectedState && <><Text className="mx-2 text-slate-300">/</Text><TouchableOpacity onPress={() => setStep(3)}><Text className={`${step === 3 ? 'font-bold text-primary' : 'text-slate-500'}`}>{selectedState.name}</Text></TouchableOpacity></>}
      {selectedDistrict && <><Text className="mx-2 text-slate-300">/</Text><TouchableOpacity onPress={() => setStep(4)}><Text className={`${step === 4 ? 'font-bold text-primary' : 'text-slate-500'}`}>{selectedDistrict.name}</Text></TouchableOpacity></>}
      {selectedCity && <><Text className="mx-2 text-slate-300">/</Text><TouchableOpacity onPress={() => setStep(5)}><Text className={`${step === 5 ? 'font-bold text-primary' : 'text-slate-500'}`}>{selectedCity.name}</Text></TouchableOpacity></>}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 p-6 max-w-5xl mx-auto w-full">
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.push('/logistics')} className="mr-4 w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm">
            <FontAwesome5 name="arrow-left" size={16} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-3xl font-black text-slate-800 tracking-tight">Configure Territories</Text>
        </View>
      </View>

      {renderBreadcrumbs()}

      <View className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
        {step === 1 && (
          <View>
            <Text className="text-xl font-bold text-slate-800 mb-2">Step 1: Select Country</Text>
            <Text className="text-slate-500 mb-6">Choose the sovereign territory for this logistics branch.</Text>
            
            <TouchableOpacity onPress={() => setShowCountryPicker(true)} className="bg-slate-50 border border-slate-300 p-4 rounded-xl flex-row justify-between items-center mb-6">
              <Text className="text-slate-700 text-lg font-medium">{selectedCountry ? selectedCountry.name : 'Select a Country...'}</Text>
              <FontAwesome5 name="chevron-down" size={14} color="#64748b" />
            </TouchableOpacity>

            <Text className="font-bold text-slate-400 uppercase text-xs mb-3">Recently Active Countries</Text>
            <View className="flex-row flex-wrap">
              {dbCountries.map(c => (
                <TouchableOpacity key={c.id} onPress={() => { setSelectedCountry(c); setStep(2); fetchLocations('states', c.id); }} className="bg-primary/10 px-4 py-2 rounded-full mr-2 mb-2 border border-primary/20">
                  <Text className="text-primary font-bold">{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="text-xl font-bold text-slate-800 mb-2">Step 2: State / Province</Text>
            <Text className="text-slate-500 mb-6">Define the regional state within {selectedCountry?.name}.</Text>
            <View className="flex-row mb-6">
              <TextInput value={customInput} onChangeText={setCustomInput} placeholder="Type State Name..." className="flex-1 bg-slate-50 border border-slate-300 p-4 rounded-l-xl text-lg" />
              <TouchableOpacity onPress={handleAddState} className="bg-primary px-6 items-center justify-center rounded-r-xl">
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Add & Continue</Text>}
              </TouchableOpacity>
            </View>
            <ScrollView className="max-h-60">
              {states.map(s => (
                <TouchableOpacity key={s.id} onPress={() => { setSelectedState(s); setStep(3); fetchLocations('districts', s.id); }} className="p-4 border-b border-slate-100 flex-row justify-between items-center hover:bg-slate-50">
                  <Text className="text-lg text-slate-700">{s.name}</Text>
                  <FontAwesome5 name="chevron-right" size={14} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className="text-xl font-bold text-slate-800 mb-2">Step 3: District</Text>
            <Text className="text-slate-500 mb-6">Define the district within {selectedState?.name}.</Text>
            <View className="flex-row mb-6">
              <TextInput value={customInput} onChangeText={setCustomInput} placeholder="Type District Name..." className="flex-1 bg-slate-50 border border-slate-300 p-4 rounded-l-xl text-lg" />
              <TouchableOpacity onPress={handleAddDistrict} className="bg-primary px-6 items-center justify-center rounded-r-xl">
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Add & Continue</Text>}
              </TouchableOpacity>
            </View>
            <ScrollView className="max-h-60">
              {districts.map(d => (
                <TouchableOpacity key={d.id} onPress={() => { setSelectedDistrict(d); setStep(4); fetchLocations('cities', d.id); }} className="p-4 border-b border-slate-100 flex-row justify-between items-center hover:bg-slate-50">
                  <Text className="text-lg text-slate-700">{d.name}</Text>
                  <FontAwesome5 name="chevron-right" size={14} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text className="text-xl font-bold text-slate-800 mb-2">Step 4: City / Island</Text>
            <Text className="text-slate-500 mb-6">Define the specific city or island in {selectedDistrict?.name}.</Text>
            <View className="flex-row mb-6">
              <TextInput value={customInput} onChangeText={setCustomInput} placeholder="Type City Name..." className="flex-1 bg-slate-50 border border-slate-300 p-4 rounded-l-xl text-lg" />
              <TouchableOpacity onPress={handleAddCity} className="bg-primary px-6 items-center justify-center rounded-r-xl">
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Add & Continue</Text>}
              </TouchableOpacity>
            </View>
            <ScrollView className="max-h-60">
              {cities.map(c => (
                <TouchableOpacity key={c.id} onPress={() => { setSelectedCity(c); setStep(5); fetchLocations('hubs', c.id); }} className="p-4 border-b border-slate-100 flex-row justify-between items-center hover:bg-slate-50">
                  <Text className="text-lg text-slate-700">{c.name}</Text>
                  <FontAwesome5 name="chevron-right" size={14} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text className="text-xl font-bold text-slate-800 mb-2">Step 5: Delivery Hub & Geo-Tagging</Text>
            <Text className="text-slate-500 mb-6">Configure physical ward or hub dispatch centers for {selectedCity?.name}.</Text>
            
            <View className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
              <Text className="font-bold text-slate-700 mb-2">Hub Name / Area</Text>
              <TextInput value={customInput} onChangeText={setCustomInput} placeholder="e.g. South Port Dispatch" className="bg-white border border-slate-300 p-4 rounded-lg mb-4 text-lg" />
              
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Text className="font-bold text-slate-700 mb-2">Latitude Coordinates</Text>
                  <TextInput value={hubLat} onChangeText={setHubLat} placeholder="e.g. 11.623377" keyboardType="numeric" className="bg-white border border-slate-300 p-4 rounded-lg text-lg" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-700 mb-2">Longitude Coordinates</Text>
                  <TextInput value={hubLng} onChangeText={setHubLng} placeholder="e.g. 92.726482" keyboardType="numeric" className="bg-white border border-slate-300 p-4 rounded-lg text-lg" />
                </View>
              </View>

              <TouchableOpacity onPress={handleAddHub} className="bg-[#10b981] p-4 rounded-xl items-center flex-row justify-center shadow-sm">
                <MaterialIcons name="my-location" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Drop Pin & Create Hub</Text>
              </TouchableOpacity>
            </View>

            <Text className="font-bold text-slate-400 uppercase text-xs mb-3">Active Hubs in {selectedCity?.name}</Text>
            {hubs.map(h => (
              <View key={h.id} className="p-4 border border-slate-100 rounded-xl mb-2 flex-row justify-between items-center bg-white shadow-sm">
                <View>
                  <Text className="text-lg font-bold text-slate-800">{h.name}</Text>
                  <Text className="text-slate-400 text-sm">📍 {h.latitude}, {h.longitude}</Text>
                </View>
                <View className="bg-green-100 px-3 py-1 rounded-full"><Text className="text-green-700 text-xs font-bold">ONLINE</Text></View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Country Selection Modal */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white h-3/4 rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-slate-800">Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)} className="p-2">
                <FontAwesome5 name="times" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <TextInput 
              value={countrySearch} 
              onChangeText={setCountrySearch} 
              placeholder="Search countries..." 
              className="bg-slate-100 p-4 rounded-xl mb-4 text-lg border border-slate-200" 
            />
            <ScrollView>
              {GLOBAL_COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                <TouchableOpacity 
                  key={c.code} 
                  onPress={() => handleCountrySelect(c.name, c.code)}
                  className="p-4 border-b border-slate-100 flex-row justify-between items-center"
                >
                  <Text className="text-lg text-slate-700 font-medium">{c.name}</Text>
                  <Text className="text-slate-400">{c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
