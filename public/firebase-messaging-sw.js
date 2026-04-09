importScripts("https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDvFHR8IzQwZ6HWx9c1SL1HAOm9rQcVJ4M",
  authDomain: "neuroguard-6fff8.firebaseapp.com",
  projectId: "neuroguard-6fff8",
  storageBucket: "neuroguard-6fff8.firebasestorage.app",
  messagingSenderId: "951816159080",
  appId: "1:951816159080:web:e67b5f1ceb383d4a0e20dd",
  measurementId: "G-VD14N2JGC8"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});