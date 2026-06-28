import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo-vector-icons';
import api from '../../services/api';

export default function LogisticsHierarchyScreen() {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [hubs, setHubs] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [newItemName, setNewItemName] = useState('');
  const [newHubLat, setNewHubLat] = useState('');
  const [newHubLng, setNewHubLng] = useState('');
  const [addingType, setAddingType] = useState(null); // 'country', 'state', etc.

  useEffect(() => {
    fetchLocations('countries', null);
  }, []);

  const fetchLocations = async (type: string, parentId: number | null) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/logistics/locations.php?type=${type}${parentId ? `&parent_id=${parentId}` : ''}`);
      if (res.data.status === 'success') {
        if (type === 'countries') setCountries(res.data.data);
        if (type === 'states') setStates(res.data.data);
        if (type === 'districts') setDistricts(res.data.data);
        if (type === 'cities') setCities(res.data.data);
        if (type === 'hubs') setHubs(res.data.data);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load logistics locations');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItemName) return Alert.alert('Error', 'Name is required');
    if (addingType === 'hub' && (!newHubLat || !newHubLng)) {
      return Alert.alert('Error', 'Latitude and Longitude are required for Hubs');
    }

    let parent_id = null;
    if (addingType === 'state') parent_id = selectedCountry;
    if (addingType === 'district') parent_id = selectedState;
    if (addingType === 'city') parent_id = selectedDistrict;
    if (addingType === 'hub') parent_id = selectedCity;

    try {
      setLoading(true);
      const payload: any = { type: addingType, name: newItemName, parent_id };
      if (addingType === 'hub') {
        payload.latitude = parseFloat(newHubLat);
        payload.longitude = parseFloat(newHubLng);
      }

      const res = await api.post('/admin/logistics/locations.php', payload);
      if (res.data.status === 'success') {
        Alert.alert('Success', `${addingType.toUpperCase()} added successfully!`);
        setNewItemName('');
        setNewHubLat('');
        setNewHubLng('');
        setAddingType(null);
        
        // Refresh the list
        if (addingType === 'country') fetchLocations('countries', null);
        if (addingType === 'state') fetchLocations('states', selectedCountry);
        if (addingType === 'district') fetchLocations('districts', selectedState);
        if (addingType === 'city') fetchLocations('cities', selectedDistrict);
        if (addingType === 'hub') fetchLocations('hubs', selectedCity);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to add location');
    } finally {
      setLoading(false);
    }
  };

  const renderList = (type: string, items: any[], selectedId: number | null, onSelect: (id: number) => void) => (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-slate-100 flex-1 min-w-[250px] mx-2">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-slate-800 capitalize">{type}</Text>
        <TouchableOpacity 
          onPress={() => setAddingType(type.slice(0, -1))}
          className="bg-primary/10 px-3 py-1 rounded-full flex-row items-center"
        >
          <FontAwesome5 name="plus" size={10} color="#00B4D8" />
          <Text className="text-primary font-bold ml-2 text-xs">Add {type.slice(0, -1)}</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView className="max-h-60 h-60">
        {items.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onSelect(item.id)}
            className={`p-3 rounded-lg mb-2 flex-row justify-between items-center ${selectedId === item.id ? 'bg-primary' : 'bg-slate-50'}`}
          >
            <Text className={`font-semibold ${selectedId === item.id ? 'text-white' : 'text-slate-700'}`}>{item.name}</Text>
            {type === 'hubs' && item.latitude && (
              <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-full">
                <MaterialIcons name="my-location" size={12} color={selectedId === item.id ? 'white' : '#64748b'} />
                <Text className={`text-[10px] ml-1 ${selectedId === item.id ? 'text-white' : 'text-slate-500'}`}>Geo-tagged</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        {items.length === 0 && !loading && (
          <Text className="text-slate-400 text-center mt-4">No {type} found. Please add one.</Text>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 p-6">
      <Stack.Screen options={{ title: 'Global Logistics Hierarchy' }} />
      
      <View className="mb-6 flex-row items-center">
        <View className="w-12 h-12 bg-primary rounded-xl items-center justify-center mr-4 shadow-sm">
          <FontAwesome5 name="globe-americas" size={24} color="white" />
        </View>
        <View>
          <Text className="text-2xl font-black text-slate-800 tracking-tight">Enterprise Logistics Management</Text>
          <Text className="text-slate-500 mt-1 font-medium">Configure worldwide delivery hubs, regions, and geo-tag distribution centers.</Text>
        </View>
      </View>

      {/* Adding Modal / Overlay Inline */}
      {addingType && (
        <View className="bg-white p-6 rounded-2xl shadow-md mb-6 border-l-4 border-primary">
          <Text className="text-xl font-bold text-slate-800 mb-4 capitalize">Add New {addingType}</Text>
          <View className="flex-row flex-wrap items-end">
            <View className="mr-4 mb-4 flex-1 min-w-[200px]">
              <Text className="text-xs font-bold text-slate-500 uppercase mb-2">{addingType} Name</Text>
              <TextInput
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder={`Enter ${addingType} name...`}
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-medium"
              />
            </View>
            
            {addingType === 'hub' && (
              <>
                <View className="mr-4 mb-4 flex-1 min-w-[150px]">
                  <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Latitude</Text>
                  <TextInput
                    value={newHubLat}
                    onChangeText={setNewHubLat}
                    placeholder="e.g. 11.623377"
                    keyboardType="numeric"
                    className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-medium"
                  />
                </View>
                <View className="mr-4 mb-4 flex-1 min-w-[150px]">
                  <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Longitude</Text>
                  <TextInput
                    value={newHubLng}
                    onChangeText={setNewHubLng}
                    placeholder="e.g. 92.726482"
                    keyboardType="numeric"
                    className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-medium"
                  />
                </View>
              </>
            )}

            <View className="flex-row mb-4">
              <TouchableOpacity onPress={() => setAddingType(null)} className="bg-slate-100 px-6 py-3 rounded-lg mr-2">
                <Text className="text-slate-600 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAdd} className="bg-primary px-6 py-3 rounded-lg flex-row items-center">
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Save {addingType}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
        {renderList('countries', countries, selectedCountry, (id) => {
          setSelectedCountry(id);
          setSelectedState(null);
          setSelectedDistrict(null);
          setSelectedCity(null);
          setStates([]);
          setDistricts([]);
          setCities([]);
          setHubs([]);
          fetchLocations('states', id);
        })}

        {selectedCountry && renderList('states', states, selectedState, (id) => {
          setSelectedState(id);
          setSelectedDistrict(null);
          setSelectedCity(null);
          setDistricts([]);
          setCities([]);
          setHubs([]);
          fetchLocations('districts', id);
        })}

        {selectedState && renderList('districts', districts, selectedDistrict, (id) => {
          setSelectedDistrict(id);
          setSelectedCity(null);
          setCities([]);
          setHubs([]);
          fetchLocations('cities', id);
        })}

        {selectedDistrict && renderList('cities', cities, selectedCity, (id) => {
          setSelectedCity(id);
          setHubs([]);
          fetchLocations('hubs', id);
        })}

        {selectedCity && renderList('hubs', hubs, null, (id) => {
          // Select hub - maybe show details or map in future
        })}
      </ScrollView>
    </View>
  );
}
