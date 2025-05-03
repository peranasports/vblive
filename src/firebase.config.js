// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAjEf5r3pVy2rkUYPprGbaaM0AvG753Fwo",
  authDomain: "vblive-87014.firebaseapp.com",
  projectId: "vblive-87014",
  storageBucket: "vblive-87014.appspot.com",
  messagingSenderId: "868074677660",
  appId: "1:868074677660:web:c11594ceb52ace029ed459",
  measurementId: "G-4XP9V1TR2V"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore()
