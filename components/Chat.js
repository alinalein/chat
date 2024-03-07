import { useEffect, useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble, SystemMessage, Day } from "react-native-gifted-chat";
import { collection, onSnapshot, addDoc, query, where, orderBy } from "firebase/firestore";

const Chat = ({ route, navigation, db }) => {
    //extract name , color, userID of the route send ny Start.js
    const { name, color, userID } = route.params;
    const [messages, setMessages] = useState([]);

    const onSend = (newMessages) => {
        // callback function passed , to save /add passed message to the database
        // message to be added is first item in newMassages array [0]
        addDoc(collection(db, "messages"), newMessages[0])
    }
    // set static message -> allows to see each element of the UI displayed on the screen right away
    useEffect(() => {
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const unsubMessages = onSnapshot(q,
            (documentsSnapshot) => {
                let newMessages = [];
                documentsSnapshot.forEach(doc => {
                    newMessages.push({ id: doc.id, ...doc.data(), createdAt: new Date(doc.data().createdAt.toMillis()) })
                });
                setMessages(newMessages);
            });
        return () => {
            if (unsubMessages) unsubMessages();
        }
    }, []);
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


    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            {/* <Text>Enjoy meeting new people online.</Text> */}
            {/* component from  Gifted Chat -> comes with own props, 
            tell if what should happen  when the user sends a new message  */}
            <GiftedChat style={styles.chat}
                messages={messages}
                renderSystemMessage={renderSystemMessage}
                renderBubble={renderBubble}
                renderDay={renderDay}
                // call the function onUserSend -> when user sends new message
                onSend={messages => onSend(messages)}
                user={{
                    _id: userID
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
    }, chat: {

    }
});

export default Chat;