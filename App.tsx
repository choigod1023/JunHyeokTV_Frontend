import * as React from "react";
import { View, Text, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import webStomp from "./screens/webStomp";
import webStreaming from "./screens/webStreaming";
const Stack = createNativeStackNavigator();
const App = () => {
  const [hideSplashScreen, setHideSplashScreen] = React.useState(true);
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="webStomp"
            component={webStomp}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="webStreaming"
            component={webStreaming}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
