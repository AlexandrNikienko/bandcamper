// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentSingleTabManager, doc, setDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// your firebaseConfig from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDpvqMElsiTGm7TPI1yp6ZWGQNI_r7O6ao",
  authDomain: "bandcamper-96873.firebaseapp.com",
  projectId: "bandcamper-96873",
  storageBucket: "bandcamper-96873.firebasestorage.app",
  messagingSenderId: "360522976232",
  appId: "1:360522976232:web:8b3070ceda8f82df10f25d",
  measurementId: "G-4LS2H0H2JT"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager()
  })
});

export { db };

export const saveUserEmail = async (user) => {
  console.log("Saving user email to Firestore:", user?.email);
  if (!user || !user.email) return;

  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, { userEmail: user.email }, { merge: true });
  console.log("User email saved to Firestore:", user.email);
};
