import { useEffect, useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble, SystemMessage, Day, InputToolbar } from "react-native-gifted-chat";
import { collection, onSnapshot, addDoc, query, orderBy } from "firebase/firestore";
import CustomActions from './CustomActions';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView from 'react-native-maps';

const Chat = ({ route, navigation, db, isConnected, storage }) => {
    //extract name , color, userID of the route send ny Start.js
    const { name, color, userID } = route.params;
    const [messages, setMessages] = useState([]);

    const loadCache = async () => {
        // if something is cached ->gets the cached list from string messages, otherwise empty array
        const cachedList = await AsyncStorage.getItem('user_messages') || [];
        setMessages(JSON.parse(cachedList))
    }
    const cacheMessages = async (messagesToCache) => {
        try {
            //cache collection/documents that been loaded from the Firestore DB
            await AsyncStorage.setItem('user_messages', JSON.stringify(messagesToCache))
        } catch (error) {
            console.error(error.message)
        }
    }
    const onSend = (newMessages) => {
        // callback function passed , to save /add passed message to the database
        // message to be added is first item in newMassages array [0]
        addDoc(collection(db, "messages"), newMessages[0])
    }

    // set static message -> allows to see each element of the UI displayed on the screen right away
    useEffect(() => {
        let unsubMessages;
        if (isConnected === true) {
            //make sure there is always only one onSnapshot listener
            if (unsubMessages) unsubMessages();
            unsubMessages = null;
            // get collection and its document-> ordered by "createdAt" in descending order.
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            // sets up a listener to listen for any changes to the documents in the "messages" collection. Whenever there's a change, the callback function will be called.
            unsubMessages = onSnapshot(q,
                (documentsSnapshot) => {
                    let newMessages = [];
                    documentsSnapshot.forEach(doc => {
                        //new Date(doc.data().createdAt.toMillis()) retrieves the milliseconds representation of the Firestore timestamp and converts it to a Date object.
                        newMessages.push({ id: doc.id, ...doc.data(), createdAt: new Date(doc.data().createdAt.toMillis()) })
                    });
                    cacheMessages(newMessages)
                    setMessages(newMessages);
                });
        }
        else loadCache();
        // unsubscribes from the snapshot listener to prevent memory leaks.
        return () => {
            if (unsubMessages) unsubMessages();
        }
    }, [isConnected]);

    // will be called once, after component is mounted, set name to title of website 
    useEffect(() => {
        navigation.setOptions({ title: name });
    }, []);

    const renderDay = (props) => {
        return (
            <Day
                {...props}
                textStyle={{
                    color: 'black',
                    backgroundColor: ' rgba(248,248,248,0.6)',
                    paddingHorizontal: 15,
                    paddingVertical: 5,
                    fontWeight: '500',
                    borderRadius: 10,

                }}
            />
        );
    };
    const renderSystemMessage = (props) => {
        return (
            <SystemMessage
                {...props}
                textStyle={{
                    color: 'black',
                    backgroundColor: ' rgba(248,248,248,0.6)',
                    paddingHorizontal: 15,
                    paddingVertical: 5,
                    fontWeight: '500',
                    borderRadius: 10,
                    margin: 3
                }}
            />
        );
    };
    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                timeTextStyle={{
                    right: {
                        color: 'black',
                    }
                }}
                textStyle={{
                    right: { color: 'black', },
                }}
                wrapperStyle={{
                    right: { backgroundColor: '#d3edf8', },
                    left: { backgroundColor: '#FFF', },
                }}
            />
        )
    }

    const renderInputToolbar = (props) => {
        if (isConnected === true) {
            return (
                // passes all props received by renderInputToolbar like isConnected to component 
                // InputToolbar from Gifted Chat, imported above
                <InputToolbar
                    {...props}
                />
            )
        } else return null;
    }

    // resposible for the action button -> + 
    const renderCustomActions = (props) => {
        return (
            // pass all the props received by renderCustomActions to CustomActions component
            <CustomActions
                storage={storage} userID={userID} {...props}
            />
        )
    }

    // adding location data to the message object 
    const renderCustomView = (props) => {
        // extract current message object from the props 
        const { currentMessage } = props;
        //  checks if the currentMessage object contains a location property -> attach the location object in the getLocation()
        // wne need to render mutiple custom views -> do that by addinf if statemets for the additional custom views
        // if (currentMessage.3dModel) -> render a small 3d model viewport
        if (currentMessage.location) {    // render a map
            return (
                <MapView
                    style={{
                        width: 150,
                        height: 100,
                        borderRadius: 13,
                        margin: 3
                    }}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
    }

    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            {/* component from  Gifted Chat -> comes with own props, all in blue are the props
            tell if what should happen  when the user sends a new message  */}
            <GiftedChat style={styles.chat}
                messages={messages}
                renderSystemMessage={renderSystemMessage}
                renderBubble={renderBubble}
                renderDay={renderDay}
                // call the component CustomActions from inside the function renderCustomActions 
                // & pass it to prop renderActions-> those props passed to GiftedChat -< customize the behaviour 
                renderActions={renderCustomActions}
                renderCustomView={renderCustomView}
                renderInputToolbar={renderInputToolbar}
                // call the function onUserSend -> when user sends new message
                onSend={messages => onSend(messages)}
                user={{
                    _id: userID,
                    name: name
                }}
            />
            {/* if platform’s OS is Android -> add component KeyboardAvoidingView, otherwise do nothing
            makes sure keyboard will not overlap the UI  */}
            {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    }
});

export default Chat;