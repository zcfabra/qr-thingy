import { useQuery } from "@tanstack/react-query"
import { SetStateAction } from "react"
import { Text, TouchableOpacity, View } from "react-native"

interface ChatProps{
    setShowChats: React.Dispatch<SetStateAction<boolean>>
    participants: {
        first_uuid:string,
        second_uuid:string,
        their_name:string
    }
}

const Chat = ({setShowChats, participants}: ChatProps)=>{
    const {data} = useQuery(["chats"], async ()=>{
        const res = await fetch(`http://192.168.2.116:5000/chat/`)
    })
    return (
        <View className="w-full h-full absolute top-0 bg-black z-30 flex items-center pt-24">
            <View className="w-10/12 flex flex-row items-center justify-between">
                <Text className="text-white text-3xl">{participants.their_name}</Text>
                <TouchableOpacity onPress={()=>setShowChats(false)} className="w-24 h-8 rounded-md border border-white flex items-center justify-center">
                <Text className="font-s text-white">Back</Text>
                </TouchableOpacity>
            </View>
            
        </View>
    )
}

export default Chat