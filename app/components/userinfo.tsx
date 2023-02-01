import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { UserContext } from "../App";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Slider from "@react-native-community/slider";
import { interests } from "./signupflow";
interface UserInfoProps{
    userContext: UserContext
    setShowUserInfo: React.Dispatch<React.SetStateAction<boolean>>
}
let myInterests = interests.sort();
const UserInfo = ({userContext, setShowUserInfo}:UserInfoProps)=>{
    const [edit, setEdit] = useState<boolean>(false);
    const {data} = useQuery(["userInfo"], async ()=>{
        const res = await fetch(`http://${process.env.URL}:5000/matchinfo/${userContext.unique_id}`, {
            method: "GET"
        })
        return await res.json() as {name:string,interests:string,nightlife:number,serious:number};    
    }, {
        onSuccess(res){
            setPreferences({nightlife: res.nightlife, serious: res.serious});
            setTopInterests(res.interests.split(",").reduce((o, i)=>Object.assign(o, {[i]: true}), {}))

        }
    })
    
    
    const [topInterests, setTopInterests] = useState<{[key:string]: boolean}>({});
    const [preferences, setPreferences] = useState<{nightlife: number, serious:number}>()
    useEffect(()=>{
        // console.log("INTERESTS",topInterests)
        // console.log(preferences)
    }, [preferences, topInterests])

   

    const handleAddInterest = (interest: string)=>{
        
        // console.log("Check For Interest",interest in topInterests, interest);
        if (interest in topInterests) {
            // console.log("SHOULD BE HERE")
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

    const updateMutation = useMutation(["update"], async (data: {interests: string, nightlife: number, serious:number})=>{
        // console.log("DATA TO SEND", data)
        const res = await fetch(`http://${process.env.URL}:5000/update/${userContext.unique_id}`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json",

            },
            body: JSON.stringify(data)
        });
        
    }, {
        onSuccess(res){
            setShowUserInfo(false);
        }

    })
    return (

        <View className="w-full z-40 bg-black h-screen absolute top-0 right-0 flex items-center pt-16">
            <View className="w-10/12 justify-between flex flex-row items-center">
                <Text className="font-s text-white text-3xl">{userContext.name}</Text>
                <TouchableOpacity onPress={()=>setShowUserInfo(false)} className="w-24 h-8 rounded border border-white flex items-center justify-center">
                    <Text className="text-white text-xl font-s">Back</Text>
                </TouchableOpacity>
            </View>

          {data && !edit ?  <>
          <View className="w-full flex items-center justify-center my-4">
                <Text className="text-white font-s text-2xl">Nightlife</Text>
                <View className="w-[200px] h-1 bg-gray-500 rounded-md">
                    <View style={{width: Math.floor(data.serious * 20)}} className={`h-1 bg-pink-500`}></View>
                </View>
            </View>
            <View className="w-full flex items-center justify-center my-4">
                <Text className="text-white font-s text-2xl ">Serious</Text>
                <View className="w-[200px] h-1 bg-gray-500 rounded-md">
                    <View style={{width: Math.floor(data.nightlife * 20)}} className={`h-full bg-pink-500`}></View>
                </View>
            </View>
            <View className="w-10/12 flex flex-row items-center justify-between my-4">
                {data.interests.split(",").map((i,ix)=>(
                    <View key={ix} className="w-24 h-8 rounded-[200px] bg-pink-500 flex items-center justify-center">
                        <Text className="font-s text-white">{i}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity onPress={()=>setEdit(true)} className=" mt-auto  mb-24 w-24 h-8 rounded-md bg-pink-500 flex items-center justify-center">
                <Text className="text-xl text-white font-s">Edit</Text>
            </TouchableOpacity>
     
            
            </> : 
            <>
            <View className="w-full h-16 flex flex-col items-center mt-4">
             <Text className="font-s text-white text-lg">How much do you like nightlife?</Text>
            {preferences && preferences?.nightlife && <Slider value={preferences.nightlife} onValueChange={e=>setPreferences(prev=>({...prev!, nightlife: e}))} step={0.1} minimumTrackTintColor="#ec4899" maximumTrackTintColor="#6b7280" thumbTintColor="white" style={{width:300 , height:50}} minimumValue={0} maximumValue={10}></Slider>}
        </View>
        <View className="w-full h-16 flex flex-col items-center mt-4">
            <Text className="font-s text-white text-lg">How serious of a relationship?</Text>
            {preferences && preferences.serious && <Slider value={preferences.serious} onValueChange={e=>setPreferences(prev=>({...prev!, serious: e}))} step={0.1} minimumTrackTintColor="#ec4899" maximumTrackTintColor="#6b7280" thumbTintColor="white" style={{width:300 , height:50}} minimumValue={0} maximumValue={10}></Slider>}
        </View>
        <View className="flex-1 mb-4 flex w-full flex-col items-center pt-4">
            <Text className="font-s text-white text-lg mb-4">Pick your top 3</Text>
            <FlatList  indicatorStyle="default" data={myInterests}  renderItem={(i)=> <TouchableOpacity  onPress={()=>handleAddInterest(i.item)} className={`w-24 h-8 mx-2 flex items-center justify-center rounded-[200px] ${i.item in topInterests ? "bg-pink-500" : "border border-white"}`}>
                        <Text className="font-s text-white">{i.item}</Text>
                    </TouchableOpacity>} numColumns={3}   ItemSeparatorComponent={() => <View style={{height: 20}} />}
>

                    

            </FlatList>
            {preferences && interests && <TouchableOpacity onPress={()=>updateMutation.mutate({interests: Object.keys(topInterests).join(","), nightlife:preferences.nightlife, serious: preferences.nightlife})}className="w-24 self-end mr-4 h-8 rounded-md bg-pink-500 flex items-center justify-center">
                <Text className="font-s text-white text-xl">Update</Text>
            </TouchableOpacity>}

        </View>
                
            </>}
            
        </View>
    )
}

export default UserInfo;