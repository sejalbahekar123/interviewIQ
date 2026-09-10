
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interview-iq-9325d.firebaseapp.com",
  projectId: "interview-iq-9325d",
  storageBucket: "interview-iq-9325d.firebasestorage.app",
  messagingSenderId: "452421063506",
  appId: "1:452421063506:web:e01386f25a408eceec608b"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth , provider}  