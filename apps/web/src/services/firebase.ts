// Firebase configuration for web app
import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';
// Firebase configuration - these values should be set in environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Check if Firebase Messaging is supported
let messaging = null;
isSupported().then((supported) => {
    if (supported) {
        messaging = getMessaging(app);
    }
});
export { app, messaging };
//# sourceMappingURL=firebase.js.map