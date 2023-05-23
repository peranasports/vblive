// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjEf5r3pVy2rkUYPprGbaaM0AvG753Fwo",
  authDomain: "vblive-87014.firebaseapp.com",
  projectId: "vblive-87014",
  storageBucket: "vblive-87014.appspot.com",
  messagingSenderId: "868074677660",
  appId: "1:868074677660:web:c11594ceb52ace029ed459",
  measurementId: "G-4XP9V1TR2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);