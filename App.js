import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import the screens we want to navigate
import Start from './components/Start';
import Chat from './components/Chat';


//returns an object containing two components, Navigator and Screen
const Stack = createNativeStackNavigator();

const App = () => {
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
          //component you want to display as the screen
          component={Start}
        />
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