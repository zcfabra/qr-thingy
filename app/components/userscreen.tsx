import { Text, View } from "react-native"
import { UserContext } from "../App"
import QRCode from "react-native-qrcode-svg"
import { useEffect, useState } from "react"
import { BarCodeScanner } from 'expo-barcode-scanner';

interface UserScreenProps{
    userContext: UserContext
}
const UserScreen = ({userContext}: UserScreenProps)=>{
    const [permissions, setPermissions] = useState<boolean>();
    const [scanned, setScanned] = useState<boolean>(false);


    useEffect(()=>{
        const getBarcodePermissions = async ()=>{
            const {status} = await BarCodeScanner.requestPermissionsAsync();
            setPermissions(status == "granted");
        }

        getBarcodePermissions();
    },[])
const handleScan= ()=>{

}
return (

    <View className="w-full h-screen absolute top-0 bg-pink-500 flex items-center pt-16">
        <Text className="text-white mb-24 font-s text-2xl">Welcome {userContext.name}</Text>
        <QRCode size={200}  value={userContext.unique_id}></QRCode>
        <BarCodeScanner onBarCodeScanned={scanned ? undefined: handleScan}/>
    </View>
)
}
export default UserScreen