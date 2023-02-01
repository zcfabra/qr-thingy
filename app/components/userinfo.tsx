import { View, Text, TouchableOpacity } from "react-native";
import { UserContext } from "../App";
import { useQuery } from "@tanstack/react-query";
interface UserInfoProps{
    userContext: UserContext
    setShowUserInfo: React.Dispatch<React.SetStateAction<boolean>>
}
const UserInfo = ({userContext, setShowUserInfo}:UserInfoProps)=>{
    const {data} = useQuery(["userInfo"], async ()=>{
        const res = await fetch(`http://192.168.2.116:5000/matchinfo/${userContext.unique_id}`, {
            method: "GET"
        })
        return await res.json() as {name:string,interests:string,nightlife:number,serious:number};    })
    return (
        <View className="w-full z-40 bg-black h-screen absolute top-0 right-0 flex items-center pt-16">
            <View className="w-10/12 justify-between flex flex-row items-center">
                <Text className="font-s text-white text-3xl">{userContext.name}</Text>
                <TouchableOpacity onPress={()=>setShowUserInfo(false)} className="w-24 h-8 rounded border border-white flex items-center justify-center">
                    <Text className="text-white text-xl font-s">Back</Text>
                </TouchableOpacity>
            </View>

          {data && <>
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
     
            
            </>}
            
        </View>
    )
}

export default UserInfo;