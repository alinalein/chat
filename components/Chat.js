import { useEffect, useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble, SystemMessage, Day } from "react-native-gifted-chat";

const Chat = ({ route, navigation }) => {
    //extract name of the route
    const { name, color } = route.params;
    const [messages, setMessages] = useState([]);

    const onSend = (newMessages) => {
        // callback function passed , appends new message to newMessages array, 
        // what is then appended to previousMessages, so it can be displayed in the chat
        // previousMessages->receives the previous state & returns the new state
        setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages))
    }
    // set static message -> allows to see each element of the UI displayed on the screen right away
    useEffect(() => {
        setMessages([
            // formal & code given by Gifted Chat
            {
                _id: 1,
                text: "Hello developer",
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: "React Native",
                    avatar: "https://th.bing.com/th/id/OIP.B0rthnTNM4Ix99QEbH4TlAHaHw?rs=1&pid=ImgDetMain",
                },
            },
            {
                _id: 2,
                text: 'This is a system message',
                createdAt: new Date(),
                system: true,
            },
        ]);
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
                accessible={true}
                accessibilityLabel="Date when messages been sent"
                accessibilityHint="Double tap to read the message"
                accessibilityRole="text"
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
                accessible={true}
                accessibilityLabel="Message sent by the system to the chat"
                accessibilityHint="Double tap to read the message"
                accessibilityRole="text"
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
                accessible={true}
                accessibilityLabel={position === 'right' ? "Your message in the chat" : "Other person's message in the chat"}
                accessibilityHint="Double tap to read the message"
                accessibilityRole="text"
            />
        )
    }
    // will be called once, after component is mounted, set name to title 
    useEffect(() => {
        navigation.setOptions({ title: name });
    }, []);
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
                    _id: 1
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