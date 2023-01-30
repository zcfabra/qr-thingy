import { useQuery } from "@tanstack/react-query"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { UserContext } from "../App"
import { useState } from "react"
import Chat from "./chat"
interface MatchProps{
    setShowMatches: React.Dispatch<React.SetStateAction<boolean>>,
    userContext: UserContext
}

interface MatchObject{
    first_uuid: string
    second_uuid: string,
    first_name: string,
    second_name: string
    [key:string]: any
}
const Matches = ({setShowMatches, userContext}: MatchProps)=>{

    const [showChats, setShowChats] = useState<boolean>(false);
    const [participants, setParticipants]=useState<{first_uuid: string, second_uuid:string, their_name: string}|null>(null);
    const {data} = useQuery(["matches"],async(data)=>{
        const res = await fetch(`http://192.168.2.116:5000/allmatches/${userContext.unique_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        return await res.json();
    },{
        onSuccess(res){
            console.log(res);
        }
    });
    const handleOpenChat = (first_uuid: string,second_uuid:string, their_name:string)=>{
        setParticipants({first_uuid: first_uuid, second_uuid: second_uuid, their_name: their_name});
        setShowChats(true);
    }
    return (
        <View className="absolute top-0 z-30 w-full h-screen bg-black pt-16 flex items-center">
            {showChats && participants &&  <Chat participants={participants!} setShowChats={setShowChats}/>}
            <View className="w-10/12 h-16 flex flex-row items-center justify-between">
                <Text className="text-3xl font-s text-white">Matches</Text>
                <TouchableOpacity onPress={()=>setShowMatches(false)} className="w-24 h-8  rounded-md border border-white flex items-center justify-center">
                    <Text className="font-s text-white">Back</Text>
                </TouchableOpacity>

            </View>
            <ScrollView  className="w-full border-t border-gray-500 flex-1 mt-8 ">{
                data && (data as MatchObject[]).map((i,ix)=>(
                    <TouchableOpacity onPress={()=>handleOpenChat(i.first_uuid, i.second_uuid, i.first_name == userContext.name ? i.second_name: i.first_name)}className="w-full h-16 border-b border-gray-500 flex flex-row items-center px-8">
                        {i.first_name != userContext.name && <Text className="text-white text-xl font-s">{i.first_name}</Text>}
                        {i.second_name != userContext.name && <Text className="text-white text-xl font-s">{i.second_name}</Text>}
                    </TouchableOpacity>
                ))
            }</ScrollView>
        </View>
    )
}

export default Matches