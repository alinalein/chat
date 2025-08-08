// prevents message about AsyncStorage to show -> related to "firebase/auth"
import { LogBox, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

LogBox.ignoreLogs([
  "React keys must be passed directly to JSX without using spread",
]);

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import the screens we want to navigate
import Start from "./components/Start";
import Chat from "./components/Chat";

import { useEffect } from "react";
import { useNetInfo } from "@react-native-community/netinfo";

import { disableNetwork, enableNetwork } from "firebase/firestore";
import { db, storage } from "./firebase";
// returns an object containing two components, Navigator and Screen
const Stack = createNativeStackNavigator();

const App = () => {
  const connectionStatus = useNetInfo();

  // called when the user goes from online to offline and vice versa.
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert("You are not longer connected to the internet!");
      disableNetwork(db);
    } else {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  return (
    // responsible for managing  app state and linking the top-level navigator to the app environment
    <NavigationContainer>
      <Stack.Navigator
        // the first screen to load upon starting the app: should be name of one of the screens
        initialRouteName="Chat App"
      >
        <Stack.Screen
          // handler that is used to open or navigate to the screen: not necessarily component name
          name="Chat App"
          component={Start}
        />
        <Stack.Screen name="Chat">
          {/* pass prop bd & storage to Chat component */}
          {(props) => (
            <SafeAreaProvider>
              <Chat
                isConnected={connectionStatus.isConnected}
                storage={storage}
                db={db}
                {...props}
              />
            </SafeAreaProvider>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
