import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import the screens we want to navigate
import Start from './components/Start';
import Chat from './components/Chat';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

  return (
    // responsible for managing your app state and linking your top-level navigator to the app environment
    <NavigationContainer>
      <Stack.Navigator
        //the first screen to load upon starting your app- should be name of one of the screens
        initialRouteName="Start"
      >
        <Stack.Screen
          //  handler that you’ll use to open or navigate to the screen-not necessarily component name
          name="Start"
        >
          {/* pass prop bd to start */}
          {props => <Start db={db} {...props} />}
        </Stack.Screen>
        <Stack.Screen
          name="Chat"
          component={Chat}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
});
export default App;