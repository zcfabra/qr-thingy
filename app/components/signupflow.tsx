import React, { SetStateAction, useState } from "react"
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native"
import Slider from '@react-native-community/slider';
import { useMutation } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store"
import { UserContext } from "../App";
export interface UserSignupInfo{
    name: string,
    interests: string,
    serious: number,
    nightlife:number
}
export let interests = ["Cooking", "Philosophy", "Coding", "Gym", "Bars", "Jazz", "Gaming", "Fashion", "Guitar", "Violin", "Painting", "Drawing", "Movies", "Art", "Restaurants", "Travel", "Shopping", "Comedy", "Sports"]
interests = interests.sort()
interface SignupProps {
    setUserContext: React.Dispatch<SetStateAction<UserContext | undefined>>
}
const SignupFlow = ({setUserContext}: SignupProps)=>{
    const [userName, setUserName] = useState<string>();
    const [preferences, setPreferences] = useState<{nightlife: number, serious:number}>({nightlife:0.0, serious:0.0})
    const [topInterests, setTopInterests] = useState<{[key:string]: boolean}>({});
    const handleAddInterest = (interest: string)=>{
        
        if (interest in topInterests) {
            console.log("SHOULD BE HERE")
            setTopInterests(prev=>{
                const n = {...prev}
                delete n[interest];
                return n;
            })
        } else {
            if (Object.keys(topInterests).length ==3 ) return;
            setTopInterests(prev=>{
            return {
                ...prev,
                [interest]: true
            }
        })

        }
        
        
    }

    const signupMutation = useMutation(["signup"], async (data:UserSignupInfo)=>{
        const res = await fetch(`http://${process.env.URL}:5000/signup`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    },{
        async onSuccess(res){
            console.log("RES: ", res);
            const ctx = {name: res["name"], unique_id: res["unique_id"], user_id: res["ID"]} as UserContext
            await SecureStore.setItemAsync("context", JSON.stringify(ctx))
            setUserContext(ctx)
        }
    })

    return (
        <View className="w-full h-screen bg-black absolute top-0 left-0 flex flex-col items-center pt-24">
            <Text className="text-3xl font-s text-white">Sign Up</Text>
            <TextInput value={userName} onChangeText={e=>setUserName(e)} placeholderTextColor={'white'} placeholder="Name" className="h-12 mt-8 rounded-md text-xl text-white w-10/12 border border-white px-4"></TextInput>
               <View className="w-full h-16 flex flex-col items-center mt-4">
            <Text className="font-s text-white text-lg">How much do you like nightlife?</Text>
            <Slider value={preferences.nightlife} onValueChange={e=>setPreferences(prev=>({...prev, nightlife: e}))} step={0.1} minimumTrackTintColor="#ec4899" maximumTrackTintColor="#6b7280" thumbTintColor="white" style={{width:300 , height:50}} minimumValue={0} maximumValue={10}></Slider>
        </View>
        <View className="w-full h-16 flex flex-col items-center mt-4">
            <Text className="font-s text-white text-lg">How serious of a relationship?</Text>
            <Slider value={preferences.serious} onValueChange={e=>setPreferences(prev=>({...prev, serious: e}))} step={0.1} minimumTrackTintColor="#ec4899" maximumTrackTintColor="#6b7280" thumbTintColor="white" style={{width:300 , height:50}} minimumValue={0} maximumValue={10}></Slider>
        </View>
        <View className="flex-1 mb-4 flex w-full flex-col items-center pt-4">
            <Text className="font-s text-white text-lg mb-4">Pick your top 3</Text>
            <FlatList  indicatorStyle="default" data={interests}  renderItem={(i)=> <TouchableOpacity  onPress={()=>handleAddInterest(i.item)} className={`w-24 h-8 mx-2 flex items-center justify-center rounded-[200px] ${i.item in topInterests ? "bg-pink-500" : "border border-white"}`}>
                        <Text className="font-s text-white">{i.item}</Text>
                    </TouchableOpacity>} numColumns={3}   ItemSeparatorComponent={() => <View style={{height: 20}} />}
>

                    

            </FlatList>

        </View>
        <View className="w-full h-16 flex flex-row px-4 items-center justify-end">
            {userName && Object.keys(topInterests).length ==3 &&
             <TouchableOpacity onPress={()=>signupMutation.mutate({name: userName, interests: Object.keys(topInterests).join(","), nightlife: preferences.nightlife, serious: preferences.serious})} className="w-24 h-10 rounded-md bg-pink-500 flex items-center justify-center">
                <Text className="text-white font-s text-lg">Join</Text>
            </TouchableOpacity>}
            
        </View>
        </View>
    )

}

export default SignupFlow