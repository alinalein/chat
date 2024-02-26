import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';

const Chat = ({ route, navigation }) => {
    //extract name of the route
    const { name, color } = route.params;

    // will be called once, after component is mounted
    useEffect(() => {
        navigation.setOptions({ title: name });
    }, []);
    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            <Text>Enjoy meeting new people online.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default Chat;