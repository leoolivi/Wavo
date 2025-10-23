import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Profile() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Profile screen</Text>
      <Link href="/">
        <Text>Vai ad Home</Text>
      </Link>
    </View>
  );
}
