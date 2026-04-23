import React, { useEffect, useState } from 'react';
import { NotificationService } from '../../services/notificationService';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, doc, updateDoc } from '../../services/firebase';

export const NotificationManager: React.FC = () => {
    const { user } = useAuth();
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        checkPermission();

        // Listen for incoming messages
        const unsubscribe = NotificationService.addListener('pushNotificationReceived', (notification: any) => {
            console.log('Push received:', notification);
            // Native handles its own UI usually, but for web or foreground we can log or toast
        });

        // Register if already granted
        if (permissionGranted && user) {
            NotificationService.register().then(token => {
                if (token) {
                    console.log("Push Token:", token);
                    updateDoc(doc(db, "users", user.uid), { fcmToken: token }).catch(console.error);
                }
            });
        }
    }, [permissionGranted, user]);

    const checkPermission = async () => {
        const status = await NotificationService.checkPermissions();
        setPermissionGranted(status.granted);
        if (status.granted && user) {
            const token = await NotificationService.register();
            if (token) {
                updateDoc(doc(db, "users", user.uid), { fcmToken: token }).catch(console.error);
            }
        }
    };

    const handleRequestPermission = async () => {
        const status = await NotificationService.requestPermissions();
        setPermissionGranted(status.granted);
        if (status.granted && user) {
            const token = await NotificationService.register();
            console.log("Registered Push Token:", token);
            if (token) {
                await updateDoc(doc(db, "users", user.uid), { fcmToken: token });
                // Don't alert here to avoid interrupting the UI, it's just a floating button
            }
        }
    };

    if (permissionGranted) return null;

    return (
        <div className="fixed bottom-24 right-4 md:bottom-28 md:right-8 z-50 animate-bounce-slow">
            <button
                onClick={handleRequestPermission}
                className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full shadow-lg flex items-center gap-2 transition-all"
                title="Activa les notificacions"
            >
                <Bell size={20} />
                <span className="text-xs font-medium">Activa avisos</span>
            </button>
        </div>
    );
};
