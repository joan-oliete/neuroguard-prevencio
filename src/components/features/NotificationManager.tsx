import React, { useEffect, useState } from 'react';
import { NotificationService } from '../../services/notificationService';
import { Bell } from 'lucide-react';

export const NotificationManager: React.FC = () => {
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        checkPermission();

        // Listen for incoming messages
        const unsubscribe = NotificationService.addListener('pushNotificationReceived', (notification: any) => {
            console.log('Push received:', notification);
            // Native handles its own UI usually, but for web or foreground we can log or toast
        });

        // Register if already granted
        if (permissionGranted) {
            NotificationService.register().then(token => {
                if (token) console.log("Push Token:", token);
            });
        }
    }, [permissionGranted]);

    const checkPermission = async () => {
        const status = await NotificationService.checkPermissions();
        setPermissionGranted(status.granted);
        if (status.granted) {
            NotificationService.register();
        }
    };

    const handleRequestPermission = async () => {
        const status = await NotificationService.requestPermissions();
        setPermissionGranted(status.granted);
        if (status.granted) {
            const token = await NotificationService.register();
            console.log("Registered Push Token:", token);
        }
    };

    if (permissionGranted) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce-slow">
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
