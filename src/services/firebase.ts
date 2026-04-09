import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  getDocs,
  increment,
  limit,
  where
} from "firebase/firestore";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging
} from "firebase/messaging";
import { getStorage } from "firebase/storage";
import { getVertexAI } from "firebase/vertexai";
import { RelapseManual, UserProfile } from "../types";

// Configuració del nou projecte NeuroGuard
const firebaseConfig = {
  apiKey: "AIzaSyBiGJPddWtHCqYBkjkcZeyLt6SmnAfnT3c",
  authDomain: "neuroguard-6fff8.firebaseapp.com",
  projectId: "neuroguard-6fff8",
  storageBucket: "neuroguard-6fff8.firebasestorage.app",
  messagingSenderId: "951816159080",
  appId: "1:951816159080:web:e67b5f1ceb383d4a0e20dd",
  measurementId: "G-VD14N2JGC8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


// Initialize Firestore with persistent cache (Modern SDK approach)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

let messaging: Messaging | undefined;
try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn("Firebase Messaging not supported in this environment (likely WebView/Mobile without SW).");
}
export { messaging };
export const storage = getStorage(app);
export const vertexAI = getVertexAI(app);

// --- HELPER FUNCTIONS ---

export const createInitialUser = async (user: FirebaseUser) => {
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // Create first manual
    const newManualRef = await addDoc(collection(db, `users/${user.uid}/manuals`), {
      createdAt: serverTimestamp(),
      motivations: [],
      values: { selected: [], details: {} },
      triggers: [],
      trapThoughts: [],
      selfCarePlan: {},
      supportNetwork: [],
      crisisPlan: { signal: '', action: '', contact: '', value: '' },
      weeklyReview: '',
      gratitudeJournal: []
    });

    // Create user profile
    await setDoc(userDocRef, {
      email: user.email,
      name: '',
      surname: '',
      phone: '',
      activeManualId: newManualRef.id,
      lastConsumptionDate: null,
      createdAt: serverTimestamp(),
      // Initialize new fields
      type: 'adult',
      streak: 0,
      currency: 0,
      level: 1,
      hasCompletedTutorial: false
    });
  }
};

export const createNewManual = async (uid: string) => {
  const newManualRef = await addDoc(collection(db, `users/${uid}/manuals`), {
    createdAt: serverTimestamp(),
    motivations: [],
    values: { selected: [], details: {} },
    triggers: [],
    trapThoughts: [],
    selfCarePlan: {},
    supportNetwork: [],
    crisisPlan: { signal: '', action: '', contact: '', value: '' },
    weeklyReview: '',
    gratitudeJournal: []
  });

  await updateDoc(doc(db, "users", uid), { activeManualId: newManualRef.id });
  return newManualRef.id;
};

export const archiveManual = async (uid: string) => {
  return await createNewManual(uid);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) return { id: snap.id, ...snap.data() } as UserProfile;
  return null;
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  addDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  getDocs,
  getToken,
  onMessage,
  increment,
  limit,
  where
};