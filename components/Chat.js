import { useEffect, useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, TouchableOpacity, Platform, Text, Alert } from 'react-native';
import { GiftedChat, Bubble, SystemMessage, Day, InputToolbar } from "react-native-gifted-chat";
import { collection, onSnapshot, addDoc, query, orderBy } from "firebase/firestore";
import CustomActions from './CustomActions';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView from 'react-native-maps';
import { Audio } from "expo-av";

const Chat = ({ route, navigation, db, isConnected, storage }) => {

    // extract name , color, userID of the route send by Start.js
    const { name, color, userID } = route.params;
    const [messages, setMessages] = useState([]);
    let soundObject = null;

    // loads a message from the cache if one was previously cached
    const loadCache = async () => {
        const cachedList = await AsyncStorage.getItem('user_messages') || [];
        setMessages(JSON.parse(cachedList))
    }

    const cacheMessages = async (messagesToCache) => {
        try {
            await AsyncStorage.setItem('user_messages', JSON.stringify(messagesToCache))
        } catch (error) {
            console.error(error.message)
        }
    }

    // adds the new message to the db
    const onSend = (newMessages) => {
        addDoc(collection(db, "messages"), newMessages[0])
    }


    useEffect(() => {
        let unsubMessages;
        if (isConnected === true) {
            // to make sure there is only one onSnapshot listener
            if (unsubMessages) unsubMessages();
            unsubMessages = null;
            // get collection and its document in desc order
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            // sets up a listener that will call callback function whenever any changes made to documents in the "messages" collection
            unsubMessages = onSnapshot(q,
                (documentsSnapshot) => {
                    let newMessages = [];
                    documentsSnapshot.forEach(doc => {
                        // toMillis()) retrieves the milliseconds representation of the Firestore timestamp
                        newMessages.push({ id: doc.id, ...doc.data(), createdAt: new Date(doc.data().createdAt.toMillis()) })
                    });
                    cacheMessages(newMessages)
                    setMessages(newMessages);
                });
        }
        else loadCache();

        return () => {
            // clean up 
            if (unsubMessages) unsubMessages();
            if (soundObject) soundObject.unloadAsync();
        }
    }, [isConnected]);

    // set name to title of website , once after componen mouted
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
                // passes all received props by renderInputToolbar, like isConnected to component 
                <InputToolbar
                    {...props}
                />
            )
        } else return null;
    }

    // resposible for the action button -> + 
    const renderCustomActions = (props) => {
        return (
            // pass all reiceved props by Gifed Chat component 
            <CustomActions
                storage={storage} userID={userID} {...props}
            />
        )
    }

    // adding location data to the message object 
    const renderCustomView = (props) => {
        const { currentMessage } = props;
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

    const playSound = async (audioUri) => {
        try {
            // settings to play audio on iOS
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                // Ensure the sound plays through the speakers
                defaultToSpeaker: true
            });
            if (soundObject) {
                await soundObject.unloadAsync();
            }

            const { sound } = await Audio.Sound.createAsync({
                uri: audioUri
            });
            // assign the audio from the uri to the set soundObject
            soundObject = sound;
            await soundObject.playAsync();
        } catch (error) {
            console.error('Error playing sound', error);
            Alert.alert("Error", "Failed to play the sound.");
        }
    }

    const renderMessageAudio = (props) => {
        return (
            <View {...props}>
                <TouchableOpacity
                    style={{
                        backgroundColor: "#cce7ff", borderRadius: 10, margin: 5
                    }}
                    // call playSound function and pass the audio prop from the sendRecordedSound function of current message 
                    onPress={() => playSound(props.currentMessage.audio)}
                >
                    <Text style={{
                        textAlign: "center", color: 'black', padding: 5
                    }}>Play Sound</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            {/* component from  Gifted Chat -> comes with own props, in blue are the props that are send to diffrent message types  */}
            <GiftedChat style={styles.chat}
                messages={messages}
                renderSystemMessage={renderSystemMessage}
                renderBubble={renderBubble}
                renderDay={renderDay}
                // call the component CustomActions from inside the function renderCustomActions 
                // & pass it to prop renderActions -> those props passed to GiftedChat -> customize the behaviour 
                renderActions={renderCustomActions}
                renderCustomView={renderCustomView}
                renderInputToolbar={renderInputToolbar}
                renderMessageAudio={renderMessageAudio}
                onSend={messages => onSend(messages)}
                user={{
                    _id: userID,
                    name: name
                }}
            />
            {/* makes sure keyboard will not overlap the UI for Android */}
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