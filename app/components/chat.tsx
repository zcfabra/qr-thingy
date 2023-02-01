import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Platform } from "expo-modules-core";
import { SetStateAction, useContext, useEffect, useState } from "react"
import { KeyboardAvoidingView, ScrollView, Text, TextInput, Touchable, TouchableOpacity, View } from "react-native"
import { UserContext } from "../App";
import MatchInfo from "./matchinfo";

interface ChatProps{
    setShowChats: React.Dispatch<SetStateAction<boolean>>
    participants: {
        first_uuid:string,
        second_uuid:string,
        their_name:string
    }
    userContext: UserContext
    chat_id: string
}


interface Message{
    chat_id:string,
    from:string,
    to:string
    body:string
}

const Chat = ({setShowChats, participants, chat_id, userContext}: ChatProps)=>{
    // const queryClient = useQueryClient();
    const [socket,setSocket] = useState<WebSocket>();
    const [chats, setChats] = useState<Message[]>([]);
      const {data} = useQuery(["chats"], async ()=>{
        const res = await fetch(`http://192.168.2.116:5000/chatmessages/${chat_id}`);
        return await res.json();
    })
    const queryClient = useQueryClient();

    useEffect(()=>{
        console.log("Yo")
       const socket = new WebSocket(`ws://192.168.2.116:5000/ws/${chat_id}`);
       console.log(socket)

       socket.onopen = ()=>{
        console.log("hi")
        // socket.send("YAYA")
        setSocket(socket);
       }
       socket.onmessage = (e)=>{
        
        console.log(chat_id)
        console.log(e)
        const parsed = JSON.parse(e.data)
        queryClient.setQueryData(["chats"], (prev: any)=>{
            return [...prev, parsed]
        })
       }

       return ()=>{
        socket.close();
       }
    }, []) 
  
    const [msg, setMsg] = useState<string | undefined >(undefined);
    const [showMatchInfo, setShowMatchInfo] = useState<boolean>(false);

    const handleSendMessage = ()=>{
        if (socket && msg) socket.send(JSON.stringify({body: msg, chat_id: chat_id, from: userContext.unique_id, to: participants.first_uuid == userContext.unique_id ? participants.second_uuid:  participants.first_uuid } as Message));
        setMsg("");
    }
    return (
        <KeyboardAvoidingView className="w-full h-screen absolute top-0 bg-black z-30 flex items-center pt-24"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            {showMatchInfo && <MatchInfo setShowChats={setShowChats}match_id={chat_id} setShowMatchInfo={setShowMatchInfo} their_id={participants.first_uuid == userContext.unique_id ? participants.second_uuid : participants.first_uuid} their_name={participants.their_name}/>}
            <View className="w-10/12 flex flex-row items-center justify-between">
                <TouchableOpacity onPress={()=>setShowMatchInfo(true)} className="w-36 h-16">
                    <Text className="text-white text-3xl">{participants.their_name}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setShowChats(false)} className="w-24 h-8 rounded-md border border-white flex items-center justify-center">
                <Text className="font-s text-white">Back</Text>
                </TouchableOpacity>
            </View>
            <View className="flex-1 w-full border-t border-white mt-8 py-4">
                <ScrollView className="h-full">
                    {data&&data.map((i:Message,ix:number)=>(
                        <View key={ix} className={`w-full my-2 min-h-[48px] flex flex-row ${userContext.unique_id == i.from ? "justify-end" : "justify-start"} items-center px-4`}>
                            <View className={`h-full rounded-md  p-2 ${userContext.unique_id == i.from?"bg-pink-500" : "bg-green-500"} min-w-[100px]`}>
                                <Text className="text-white font-s">{i.body}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
            <View className="w-full h-12  flex flex-row">
                <TextInput value={msg} onChangeText={e=>setMsg(e)} className="w-9/12 h-full text-white px-4 border border-white"></TextInput>
                <TouchableOpacity onPress={handleSendMessage}className="w-3/12 h-full bg-white text-black flex items-center justify-center">
                    <Text className="text-black font-s">Send</Text>
                </TouchableOpacity>
            </View>
            
        </KeyboardAvoidingView>
    )
}

export default Chat