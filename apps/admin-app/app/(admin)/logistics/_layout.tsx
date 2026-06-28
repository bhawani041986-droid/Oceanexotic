import { Stack } from 'expo-router';

export default function LogisticsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Logistics Overview', headerShown: false }} />
      <Stack.Screen name="territories" options={{ title: 'Configure Territories', headerShown: true }} />
    </Stack>
  );
}
