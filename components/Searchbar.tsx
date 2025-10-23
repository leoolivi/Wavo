import { TextInput, View, Pressable } from "react-native";
import { Search, X } from "lucide-react-native";
import { useRef } from "react";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (text: string) => void;
  onClean: () => void;
  placeholder?: string;
}

export default function Searchbar({ value, onChangeText, onSearch, onClean, placeholder = "Search..." }: SearchBarProps) {

  return (
  <View className="w-full mb-4 flex-row items-center border border-gray-300 rounded-lg px-3 overflow-hidden">
    <Pressable className="p-2" onPress={() => {onSearch(value)}}>
        <Search size={20} color="#666" />
    </Pressable>
    <TextInput 
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={() => onSearch(value)}
        returnKeyType="search"
        placeholder={placeholder}
        className="flex-1 p-2"
        placeholderTextColor="#999"
    />
    {(value != "" && value) ? (<Pressable className="p-2" onPress={() => {onClean()}}>
        <X size={20} color="#666" />
    </Pressable>) : null}
    
  </View>

  )
  ;
}