import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDI2vjUoLuzITgjO13qVnFHsvWpX1SkNfE",
  authDomain: "typing-sekolah-bening.firebaseapp.com",
  projectId: "typing-sekolah-bening",
  storageBucket: "typing-sekolah-bening.firebasestorage.app",
  messagingSenderId: "552226294927",
  appId: "1:552226294927:web:4a007414bc42b44b8774fa"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
