import { Stack } from "expo-router";
import '../global.css';

export default function RootLayout() {
  return <Stack>
    <Stack.Screen 
      name="index"
      options={{
        headerTitle: "Home",
        headerShown: false,
      }}
    />
    <Stack.Screen 
      name="profile"
      options={{
        headerTitle: "Profile",
        headerShown: false,
      }}
    />
  </Stack>;
}
