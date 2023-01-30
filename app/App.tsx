import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View className="w-full h-full bg-black flex flex-col pt-24 items-center">
        <Text className='text-white'>Yo</Text>
      <StatusBar style="auto" />
    </View>
  );
}

