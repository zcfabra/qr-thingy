import { Text, TouchableOpacity, View } from "react-native"
import { UserContext } from "../App"
import QRCode from "react-native-qrcode-svg"
import { useEffect, useState } from "react"
import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner';
import { useMutation } from "@tanstack/react-query";
import { Ionicons } from '@expo/vector-icons'; 
import Matches from "./matches";
import UserInfo from "./userinfo";


interface UserScreenProps{
    userContext: UserContext
}
const UserScreen = ({userContext}: UserScreenProps)=>{
    const [permissions, setPermissions] = useState<boolean>();
    const [showUserInfo, setShowUserInfo] = useState<boolean>(true);
    const [scanned, setScanned] = useState<boolean>(false);
    const [showScanner, setShowScanner] = useState<boolean>(false);
    const [showMatches, setShowMatches] = useState<boolean>(false);
    const matchMutation = useMutation(["match"], async (data:{user_id: string, name: string, id_to_lookup: string})=>{
        const res = await fetch("http://192.168.2.116:5000/match", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        return res;
    }, {
        onSuccess(res){
            console.log(JSON.stringify(res));
            setShowScanner(false);
            setScanned(false);
        }
    })

    useEffect(()=>{
        const getBarcodePermissions = async ()=>{
            const {status} = await BarCodeScanner.requestPermissionsAsync();
            setPermissions(status == "granted");
        }

        getBarcodePermissions();
    },[])
const handleScan: BarCodeScannedCallback= ({type, data})=>{
    setScanned(true);
    console.log("TYPE",type)
    console.log("DATA",data)

    if (type == "256"){
        matchMutation.mutate({id_to_lookup: data, user_id: userContext.unique_id, name: userContext.name});
    }

}
return (

    <View className="w-full h-screen absolute z-10 top-0 bg-pink-500 flex items-center pt-16">
        {showUserInfo && <UserInfo setShowUserInfo={setShowUserInfo} userContext={userContext}/>}
        {showMatches && <Matches userContext={userContext} setShowMatches={setShowMatches}/> }
        {showScanner && <View className="w-full z-20 h-screen flex items-center absolute top-0 left-0 bg-black">
            <TouchableOpacity onPress={()=>setShowScanner(false)} className="w-16 absolute top-4 right-4 z-20 h-16 flex items-center justify-center">
                <Text className="text-white text-4xl font-s ">X</Text>
            </TouchableOpacity>
            <BarCodeScanner    style={{width:300, height: 800}}     onBarCodeScanned={scanned ? undefined : handleScan}/>
            </View>}
        <Text className="text-white mb-24 font-s text-2xl">Welcome {userContext.name}</Text>
        <QRCode size={200}  value={userContext.unique_id}></QRCode>
        <View className="w-full mt-auto h-24  flex flex-row items-center justify-center space-x-4">
            <TouchableOpacity onPress={()=>setShowUserInfo(true)} className="w-16 h-16 flex items-center justify-center ">
                <Ionicons name="ios-person" size={24} color="white" />            
            </TouchableOpacity>
            <TouchableOpacity className="w-16  h-16 border border-white rounded-[200px] " onPress={()=>setShowScanner(true)}></TouchableOpacity>
            <TouchableOpacity onPress={()=>setShowMatches(true)} className="w-16 h-16 items-center justify-center">
                <Ionicons name="chatbox" size={36} color="white" />
            </TouchableOpacity>
        </View>
    </View>
        
)
}
export default UserScreen