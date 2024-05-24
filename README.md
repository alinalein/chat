## Chat App
The chat app is designed for mobile devices using React Native. It provides users with a chat interface and options to chat, share images, share audios and their location.

## Technology Stack 
- **React Native** : Framework for building cross-platform mobile applications using JavaScript and React.
- **Expo** :  Platform that simplifies the development of universal, native-quality mobile apps using JavaScript and React Native.
- **Google Firestore Database / Authentication / Cloud Storage** :  Offers a scalable NoSQL database, authentication services, and cloud storage for building real-time applications.
- **Gifted Chat library** :  React Native library providing customizable UI components for creating feature-rich messaging applications.
- **Expo ImagePicker API / Location API** : ImagePicker API enables integration of camera and photo library functionalities, while the Location API allows access to GPS services for location-based features in Expo apps.
  
## Getting started 
### 1. Make sure you have Expo CLI installed 

```
npm install -g expo-cli
```

### 2. Database configuration
- Please create a Firebase Account & then a new project in the Firebase console: https://console.firebase.google.com/
- Cloud Firestore DB: Initialize a new database and set its rules to:  allow read, write: if **true**;
- Firebase Authentication: Activate anonymous authentication for the app.
- Firebase Storage: Activate storage by clicking on "Start now" and set its rules to:  allow read, write: if **true**;
- Configuration: Under the project settings, add a new app and follow the steps provided by Firebase until you obtain the configuration code.
```
  const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```
- Add this code to your main component and configure it in your app.
```
import { initializeApp } from "firebase/app";

const app = initializeApp(firebaseConfig);
```

### 3. Installation 
#### Clone the repository:

```
git clone https://github.com/alinalein/chat.git
```

#### Change the directory:

```
cd chat
```

#### Install the dependencies

```
npm install
```

#### Run the server

```
npm start
```

#### On your emulator or the Expo Go app on your phone, click on the running link after logging in to your Expo account

<img width="200" alt="image" src="https://github.com/alinalein/chat/assets/111589183/39ff7a54-eca7-4e8e-b308-330979264c84">

## User Stories
As a new user, I want to be able to easily enter a chat room so I can quickly start talking to my friends and family.

As a user, I want to be able to send messages to my friends and family members to exchange the latest news.

As a user, I want to send images to my friends to show them what I’m currently doing.

As a user, I want to share my location with my friends to show them where I am.

As a user, I want to share audio recordings with my friends to keep them updated on current events.

As a user, I want to be able to read my messages offline so I can reread conversations at any time.

As a user with a visual impairment, I want to use a chat app that is compatible with a screen reader so that I can engage with the chat interface.

## App User Interface
<img width="300" alt="image" src="https://github.com/alinalein/chat/assets/111589183/8157c026-4eb9-491c-a1ac-4cb004255c47">
<img width="300" alt="image" src="https://github.com/alinalein/chat/assets/111589183/eb7a7cf3-4819-49a2-bfc8-2ed3aabbc616">



