import { StyleSheet, TouchableOpacity, View, Text, Alert } from 'react-native';
// function's job is to fetch whatever ActionSheet is included inside the wrapper component, from gifted chat
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Audio } from "expo-av" // two main classes Audio.Recording: handles recording and Audio.Sound: handles sound
import { useEffect } from 'react';

// receives the props from Gifted Chat / storage from App.js
const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, storage, userID }) => {

    // includes showActionSheetWithOptions() function, which will initialize and show the ActionSheet
    const actionSheet = useActionSheet();

    // initialize recording object 
    let recordedObject = null;

    // in case user didnt cancel the recording but also didnt sent , clear the recordingObject 
    useEffect(() => {
        return () => {
            if (recordedObject) recordedObject.stopAndUnloadAsync();
        }
    }, []);

    // calls a function depending on the action button chosen by the user 
    const onActionPress = () => {
        const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Record a Sound', 'Cancel'];
        // to get the index of cancel -> index (4-1)= will come after 3
        const cancelButtonIndex = options.length - 1;
        actionSheet.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    // depending on the button index, calls a specific function
                    case 0:
                        pickImage();
                        return;
                    case 1:
                        takePhoto();
                        return;
                    case 2:
                        getLocation();
                        return;
                    case 3:
                        startRecording()
                        return;
                    default:
                }
            },
        );
    }

    const startRecording = async () => {
        try {
            let permissions = await Audio.requestPermissionsAsync();
            if (permissions?.granted) {
                // iOS specific config to allow recording on iPhone devices
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });
                // tell createAsync() to create a high quality audio
                Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
                    .then(results => {
                        // extract the recording from the promise 
                        return results.recording;
                    }).then(recording => {
                        // then assign the recording to the set up recordedObject
                        recordedObject = recording;
                        // after user started the recording check if user really wanted to record 
                        // by prompting him to chosse one of the options
                        Alert.alert('You are recording...', undefined, [
                            { text: 'Cancel', onPress: () => { stopRecording() } },
                            {
                                text: 'Stop and Send', onPress: () => {
                                    sendRecordedSound()
                                }
                            },
                        ],
                            { cancelable: false }
                        );
                    })
            }
        } catch (err) {
            Alert.alert('Failed to record!');
        }
    }

    const stopRecording = async () => {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: false
        });
        await recordedObject.stopAndUnloadAsync();
    }

    const sendRecordedSound = async () => {
        await stopRecording()
        // use the generateReference function to create te reference
        const uniqueRefString =
            generateReference(recordedObject.getURI());
        // upload the new audio to storage
        const newUploadRef = ref(storage, uniqueRefString);
        // fetches content from the URI
        const response = await fetch(recordedObject.getURI());
        // now converts the fetched content to a blob so Firestore storage can store it
        const blob = await response.blob();
        // 1 -> reference that the file will be uploaded to / 2 -> blob of the image file you want to upload
        uploadBytes(newUploadRef, blob).then(async (snapshot) => {
            const soundURL = await getDownloadURL(snapshot.ref)
            // passing object containing the URL under the key audio to onSend prop. so audio in message
            onSend({ audio: soundURL })
        });
    }

    const getLocation = async () => {
        let permissions = await Location.requestForegroundPermissionsAsync();
        if (permissions?.granted) {
            const location = await Location.getCurrentPositionAsync({});
            if (location) {
                // if permission granted by user, adds the location object to the onSend prop, which passes the necessary properties to show the location
                // properties like createdAt, _id, and user will be added by default 
                onSend({
                    location: {
                        longitude: location.coords.longitude,
                        latitude: location.coords.latitude,
                    },
                });
            } else Alert.alert("Error occurred while fetching location");
        } else Alert.alert("Permissions haven't been granted.");
    }

    const uploadAndSendImage = async (imageURI) => {
        const uniqueRefString = generateReference(imageURI);
        // new reference for it on the Storage Cloud
        // ref imported frm Firebase/storage , then prop , then reference string ->identifier to retrieve / download file
        const newUploadRef = ref(storage, uniqueRefString);
        // fetches content from the URI
        const response = await fetch(imageURI);
        // now converts the fetched content to a blob so Firestore storage can store it
        const blob = await response.blob();
        // 1 -> reference that the file will be uploaded to / 2 -> blob of the image file you want to upload
        uploadBytes(newUploadRef, blob).then(async (snapshot) => {
            console.log('File has been uploaded successfully');
            // retrieves the download URL of the uploaded file from Firebase Storage
            const imageURL = await getDownloadURL(snapshot.ref)
            // passing object containing the URL under the key image to onSend prop, so img shown in messages
            onSend({ image: imageURL })
        })
    }

    const pickImage = async () => {
        let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissions?.granted) {
            let result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
                await uploadAndSendImage(result.assets[0].uri) // imageURI = result.assets[0].uri
            }
            else Alert.alert("Image selection canceled.");
        }
    }

    const takePhoto = async () => {
        let permissions = await ImagePicker.requestCameraPermissionsAsync();
        if (permissions?.granted) {
            let result = await ImagePicker.launchCameraAsync();
            if (!result.canceled) await uploadAndSendImage(result.assets[0].uri); // imageURI = result.assets[0].uri
            else Alert.alert("Camera use canceled.");
        }
    }

    // allows to upload multiple images , by combining multiple strings that generate unique reference string for img to be uploaded
    // one argument to represents the picked image’s URI
    const generateReference = (uri) => {
        // represented in milliseconds since the Unix epoch (January 1, 1970, 00:00:00 UTC)
        const timeStamp = (new Date()).getTime();
        // gets the file path , then seperates by / and gets index of last array element -> name of img 
        const imageName = uri.split("/")[uri.split("/").length - 1];
        return `${userID}-${timeStamp}-${imageName}`;
    }

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onActionPress} >
            {/* wrapperStyle & iconTextStyle are default props provided by Gifted Chat */}
            <View style={[styles.wrapper, wrapperStyle]}>
                <Text style={[styles.iconText, iconTextStyle]}>+</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

export default CustomActions