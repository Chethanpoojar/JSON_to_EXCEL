// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuq0r_GkPWW9Voxb7ITgFFUOlJEaS0Ls8",
  authDomain: "show-file.firebaseapp.com",
  projectId: "show-file",
  storageBucket: "show-file.appspot.com",
  messagingSenderId: "449435768744",
  appId: "1:449435768744:web:ea622ca36aa23bf958ef9d",
  measurementId: "G-LJFC2WSD01"
};

// Initialize Firebase
export const firebaseapp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseapp);