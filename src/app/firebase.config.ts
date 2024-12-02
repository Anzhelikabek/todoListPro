import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: "AIzaSyD_jwjpiSnbYOy-tBtI1puwhV1QLSdvEEI",
  authDomain: "todolist-f5dba.firebaseapp.com",
  projectId: "todolist-f5dba",
  storageBucket: "todolist-f5dba.firebasestorage.app",
  messagingSenderId: "847661364323",
  appId: "1:847661364323:web:7cc7120f2fa3af401cb456",
  measurementId: "G-RPL9CWB2RV"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
