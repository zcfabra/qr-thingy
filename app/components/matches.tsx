import { useQuery } from "@tanstack/react-query"
import { ScrollView, Text, View } from "react-native"
interface MatchProps{
    setShowMatches: React.Dispatch<React.SetStateAction<boolean>>,
}

interface MatchObject{
    first_uuid: string
    second_uuid: string,
    first_name: string,
    second_name: string
    [key:string]: any
}
const Matches = ({setShowMatches}: MatchProps)=>{
    const {data} = useQuery(["matches"],async(data)=>{
        const res = await fetch(`http://192.168.2.116:5000/allmatches?userId=${data}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        return await res.json();
    },{});

    return (
        <View className=" absolute top-0 z-30 w-full h-screen bg-black pt-24 flex items-center">
            <Text className="text-3xl font-s text-white">Matches</Text>
            <ScrollView  className="w-full flex-1 mt-8 bg-blue-500">{
                (data as MatchObject[]).map((i,ix)=>(
                    <View className="w-full h-16 border-b border-gray-500 flex flex-row items-center"></View>
                ))
            }</ScrollView>
        </View>
    )
}

export default Matches