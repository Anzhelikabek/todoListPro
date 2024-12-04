import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: "AIzaSyABEWT8lxmvq67WAz4kpzFl6XiZXHRgYGk",
  authDomain: "todolistpro-31fa4.firebaseapp.com",
  projectId: "todolistpro-31fa4",
  storageBucket: "todolistpro-31fa4.firebasestorage.app",
  messagingSenderId: "594966594591",
  appId: "1:594966594591:web:1b0442948d98a52913412a",
  measurementId: "G-Q55GTQ9P73"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
