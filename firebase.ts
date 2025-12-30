// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBX66VuUJi5IYp_IOpXW0lcpyR0DrUjCm4",
  authDomain: "speculum-caritatis.firebaseapp.com",
  projectId: "speculum-caritatis",
  storageBucket: "speculum-caritatis.firebasestorage.app",
  messagingSenderId: "1047862276290",
  appId: "1:1047862276290:web:a6f99518e7aab6ac4ccb5b",
  measurementId: "G-G91E9VNJ33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
