import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
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
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
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

// Inicialització de nous serveis (Analytics, AppCheck, RemoteConfig)
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { Capacitor } from '@capacitor/core';
import { FirebaseAppCheck } from '@capacitor-firebase/app-check';
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config";
import { GoogleAuthProvider } from "firebase/auth";

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// The Web client ID from Google Cloud Console
const WEB_CLIENT_ID = "951816159080-g29ta0o5g33qhcp8boiih31p5gmitod7.apps.googleusercontent.com";

googleProvider.setCustomParameters({
  prompt: 'select_account',
  client_id: WEB_CLIENT_ID
});

export let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(console.warn);

// App Check
if (Capacitor.isNativePlatform()) {
  // Nadiu (Android/iOS): Utilitza Play Integrity o DeviceCheck
  FirebaseAppCheck.initialize({
    provider: 'playIntegrity', // A iOS usarà DeviceCheck/AppAttest automàticament segons config
    isTokenAutoRefreshEnabled: true,
  }).catch(e => console.warn("Native App Check failed to initialize", e));
} else if (typeof window !== 'undefined') {
  // Web: Utilitza reCAPTCHA v3
  // Configura RECAPTCHA_V3_SITE_KEY (Fictici per ara fins que l'usuari el crei a la consola)
  // Per local test pots activar el debug token a la consola de navegador
  // self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6Lc_YOUR_RECAPTCHA_KEY_HERE'), // Caldrà canviar-ho per la teva clau real Web
      isTokenAutoRefreshEnabled: true
    });
  } catch(e) {
    console.warn("Web App Check failed to initialize", e);
  }
}

export const remoteConfig = getRemoteConfig(app);
// Configuració per defecte de Remote Config
remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hora
remoteConfig.defaultConfig = {
  "welcome_message": "Benvingut/da a NeuroGuard",
  "show_new_feature": false
};

// Intenta baixar els paràmetres de Remote Config i activar-los
fetchAndActivate(remoteConfig).catch(console.warn);

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
      name: user.displayName?.split(' ')[0] || '',
      surname: user.displayName?.split(' ').slice(1).join(' ') || '',
      phone: '',
      activeManualId: newManualRef.id,
      lastConsumptionDate: null,
      createdAt: serverTimestamp(),
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
  sendPasswordResetEmail,
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
  where,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString
};