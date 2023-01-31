import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Platform } from "expo-modules-core";
import { SetStateAction, useEffect, useState } from "react"
import { KeyboardAvoidingView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import io  from "socket.io-client";

interface ChatProps{
    setShowChats: React.Dispatch<SetStateAction<boolean>>
    participants: {
        first_uuid:string,
        second_uuid:string,
        their_name:string
    }
    chat_id: string
}

const Chat = ({setShowChats, participants, chat_id}: ChatProps)=>{
    // const queryClient = useQueryClient();
    const [socket,setSocket] = useState<WebSocket>();
    const [chats, setChats] = useState<string[]>([]);

    useEffect(()=>{
        console.log("Yo")
       const socket = new WebSocket(`ws://192.168.2.116:5000/ws/${chat_id}`);
       console.log(socket)

       socket.onopen = ()=>{
        console.log("hi")
        socket.send("YAYA")
        setSocket(socket);
       }
       socket.onmessage = (e)=>{
        
        console.log(chat_id)
        console.log(e)
        setChats(prev=>[...prev, e.data]);
       }

       return ()=>{
        socket.close();
       }
    }, []) 
    // const {data} = useQuery(["chats"], async ()=>{
    //     const res = await fetch(`http://192.168.2.116:5000/chat/`);
    // })
    const [msg, setMsg] = useState<string | undefined >(undefined);

    const handleSendMessage = ()=>{
        if (socket && msg) socket.send(msg);
    }
    return (
        <KeyboardAvoidingView className="w-full h-screen absolute top-0 bg-black z-30 flex items-center pt-24"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="w-10/12 flex flex-row items-center justify-between">
                <Text className="text-white text-3xl">{participants.their_name}</Text>
                <TouchableOpacity onPress={()=>setShowChats(false)} className="w-24 h-8 rounded-md border border-white flex items-center justify-center">
                <Text className="font-s text-white">Back</Text>
                </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 w-full bg-pink-500">
                {chats.map((i,ix)=>(
                    <View key={ix} className="w-full h-12 flex flex-row items-center px-4">
                        <Text>{i}</Text>
                    </View>
                ))}
            </ScrollView>
            <View className="w-full h-12 mt-auto  flex flex-row">
                <TextInput value={msg} onChangeText={e=>setMsg(e)} className="w-9/12 h-full text-white px-4 border border-white"></TextInput>
                <TouchableOpacity onPress={handleSendMessage}className="w-3/12 h-full bg-white text-black flex items-center justify-center">
                    <Text className="text-black font-s">Send</Text>
                </TouchableOpacity>
            </View>
            
        </KeyboardAvoidingView>
    )
}

export default Chat