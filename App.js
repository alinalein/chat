// prevents message about AsyncStorage to show -> related to "firebase/auth"
import { LogBox, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
LogBox.ignoreLogs(['You are initializing Firebase Auth for React Native without providing AsyncStorage. Auth state will default to memory persistence and will not persist between sessions. In order to persist auth state, install the package "@react-native-async-storage/async-storage" and provide it to initializeAuth:']);
import { REACT_APP_FIREBASE_API_KEY, REACT_APP_FIREBASE_AUTH_DOMAIN, REACT_APP_FIREBASE_PROJECT_ID, REACT_APP_FIREBASE_STORAGE_BUCKET, REACT_APP_FIREBASE_MESSAGING_SENDER_ID, REACT_APP_FIREBASE_APP_ID } from "@env";
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

// returns an object containing two components, Navigator and Screen
const Stack = createNativeStackNavigator();

const App = () => {
  // web apps Firebase configuration
  const firebaseConfig = {
    apiKey: REACT_APP_FIREBASE_API_KEY,
    authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: REACT_APP_FIREBASE_APP_ID
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  // initialize storage 
  const storage = getStorage(app);
  const connectionStatus = useNetInfo();

  // called when the user goes from online to offline and vice versa.
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert('You are not longer connected to the internet!')
      disableNetwork(db)
    } else {
      enableNetwork(db)
    }
  }, [connectionStatus.isConnected])

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