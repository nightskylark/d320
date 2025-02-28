import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBi9fugF8dV1uChX85JqVp9EPKj2QHLVek",
    authDomain: "d320-92d9e.firebaseapp.com",
    projectId: "d320-92d9e",
    storageBucket: "d320-92d9e.firebasestorage.app",
    messagingSenderId: "290091621465",
    appId: "1:290091621465:web:f1d7684326d4cd97aea548",
    measurementId: "G-F09XQ6CZ4M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
