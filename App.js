// prevents message about AsyncStorage to show -> related to "firebase/auth"
import { LogBox, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
LogBox.ignoreLogs(['You are initializing Firebase Auth for React Native without providing AsyncStorage. Auth state will default to memory persistence and will not persist between sessions. In order to persist auth state, install the package "@react-native-async-storage/async-storage" and provide it to initializeAuth:']);

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import the screens we want to navigate
import Start from './components/Start';
import Chat from './components/Chat';

import { useEffect } from "react";
import { useNetInfo } from '@react-native-community/netinfo';

import { initializeApp } from "firebase/app";
import { getFirestore, disableNetwork, enableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";

//returns an object containing two components, Navigator and Screen
const Stack = createNativeStackNavigator();

const App = () => {
  //web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyB0vTEvHAe3tc31hOdYVFIkxNe6-XNWtag",
    authDomain: "chat-7e2b7.firebaseapp.com",
    projectId: "chat-7e2b7",
    storageBucket: "chat-7e2b7.appspot.com",
    messagingSenderId: "67703424854",
    appId: "1:67703424854:web:d97447d9b499ecd8ebf8f7"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  // initialize storage 
  const storage = getStorage(app);
  const connectionStatus = useNetInfo();

  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert('You are not longer connected to the internet!')
      disableNetwork(db)
    } else {
      enableNetwork(db)
    }
  }, [connectionStatus.isConnected])
  return (
    // responsible for managing your app state and linking your top-level navigator to the app environment
    <NavigationContainer>
      <Stack.Navigator
        //the first screen to load upon starting your app- should be name of one of the screens
        initialRouteName="Chat App"
      >
        <Stack.Screen
          //  handler that you’ll use to open or navigate to the screen-not necessarily component name
          name="Chat App"
          component={Start}
        />
        <Stack.Screen
          name="Chat"
        >
          {/* pass prop bd to start */}
          {props => <Chat isConnected={connectionStatus.isConnected} storage={storage} db={db} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;