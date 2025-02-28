import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyD4nUoB4aBIqyuB92O-1UyjELt3x95DHRA",
    authDomain: "d320-971d2.firebaseapp.com",
    projectId: "d320-971d2",
    storageBucket: "d320-971d2.firebasestorage.app",
    messagingSenderId: "895104531613",
    appId: "1:895104531613:web:488a63a0e7364545112874"
  };

  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const storage = getStorage(app);
  export const auth = getAuth(app);
  export const provider = new GoogleAuthProvider();
