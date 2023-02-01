import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SetStateAction } from "react";
import { View , Text, TouchableOpacity } from "react-native";
interface MatchInfoProps{
    setShowChats: React.Dispatch<SetStateAction<boolean>>
    match_id:string
    their_name:string
    their_id: string
    setShowMatchInfo: React.Dispatch<SetStateAction<boolean>>

}
const MatchInfo = ({their_name, their_id, setShowMatchInfo,setShowChats, match_id}: MatchInfoProps)=>{

    const queryClient = useQueryClient();
    const {data} = useQuery(["matchInfo"], async ()=>{
        const res = await fetch(`http://${process.env.URL}:5000/matchinfo/${their_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        return await res.json() as {name:string,interests:string,nightlife:number,serious:number};
    });

    const unmatchMutation = useMutation(["unmatch"], async (data:string)=>{
        console.log(data);

        const res = await fetch(`http://${process.env.URL}:5000/unmatch/${data}`, {
            method: "POST",
        });

    }, {
        onSuccess(res){
            console.log("Unmatched")
            setShowMatchInfo(false);
            setShowChats(false);
            queryClient.refetchQueries(["matches"]);
        }
    })
    return (
        <View className="absolute top-0 right-0 z-40 w-full h-screen flex flex-col items-center pt-16 bg-black">
            <View className="w-10/12 justify-between flex flex-row items-center">
                <Text className="text-white font-s text-3xl">{their_name}</Text>
                <TouchableOpacity onPress={()=>setShowMatchInfo(false)} className="w-24 h-8 rounded-md border border-white flex items-center justify-center">
                    <Text className="font-s text-white">Back</Text>
                </TouchableOpacity>
            </View>
            {data && <><View className="w-full flex items-center justify-center my-4">
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
            <TouchableOpacity onPress={()=>unmatchMutation.mutate(match_id)} className="mt-auto  mb-24 w-36 h-12 rounded-md bg-pink-500 flex items-center justify-center">
                <Text className="text-white text-2xl font-s">Unmatch</Text>
            </TouchableOpacity>
            
            </>}
        </View>
    ) 
}

export default MatchInfo;

