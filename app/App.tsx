import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as SecureStore from "expo-secure-store"
import { createContext, useContext, useEffect, useState } from 'react';
import SignupFlow from './components/signupflow';
import {useFonts} from "expo-font"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserScreen from './components/userscreen';


export interface UserContext {
  user_id: number,
  name: string, 
  unique_id: string,
}

export default function App() {
   const [fontsLoaded] = useFonts({
    'SpaceGrotesk': require('./assets/fonts/SpaceGrotesk-Light.ttf'),
  });
  if (!fontsLoaded){
    return null
  }
  const client = new QueryClient()
  return (
    <QueryClientProvider client={client}>
        <Main/>
    </QueryClientProvider>
  )
  
}

const Main = ()=>{
  const [userContext, setUserContext] = useState<UserContext>();
  useEffect(()=>{
    (async ()=>{
      // comment out the deleteItemAsync line to save the data on the phone
      await SecureStore.deleteItemAsync("context");
      const userContext = await SecureStore.getItemAsync("context");
      if (userContext) setUserContext(JSON.parse(userContext));
    })()
  },[])
  return (
    <View className="w-full h-full bg-black flex flex-col pt-24 items-center">
        {userContext ? <UserScreen userContext={userContext}></UserScreen> : <SignupFlow setUserContext={setUserContext}/>}

    </View>
  );
}

