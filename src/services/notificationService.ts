import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { messaging, getToken, onMessage } from './firebase';

export interface NotificationPermissionStatus {
    granted: boolean;
}

class NotificationServiceImpl {
    private isNative = Capacitor.isNativePlatform();

    async requestPermissions(): Promise<NotificationPermissionStatus> {
        if (this.isNative) {
            const result = await PushNotifications.requestPermissions();
            return { granted: result.receive === 'granted' };
        } else {
            if (typeof window === 'undefined' || !('Notification' in window)) return { granted: false };
            const permission = await window.Notification.requestPermission();
            return { granted: permission === 'granted' };
        }
    }

    async register(): Promise<string | null> {
        if (this.isNative) {
            return new Promise((resolve) => {
                // Register listeners FIRST, then trigger registration
                const addListeners = async () => {
                    await PushNotifications.addListener('registration', (token: Token) => {
                        resolve(token.value);
                    });
                    await PushNotifications.addListener('registrationError', (error: any) => {
                        console.error('Error on registration: ' + JSON.stringify(error));
                        resolve(null);
                    });
                    // Only start registration after listeners are bound
                    await PushNotifications.register();
                }

                addListeners().catch(e => {
                    console.error("Setup failed", e);
                    resolve(null);
                });
            });
        } else {
            if (!messaging) return null;
            // Your VAPID key
            const vapidKey = 'BLG5QYOXrXg-kH68IlGtvAjbgJ1u2OYi3-meWXgU3fa4Q_TXM7q2kEBZXOJEHJ8tG93jC0-fri57jYziCVnCbl4';
            try {
                const token = await getToken(messaging, { vapidKey });
                return token;
            } catch (error) {
                console.error("Web registration error:", error);
                return null;
            }
        }
    }

    async addListener(eventName: 'pushNotificationReceived', listenerFunc: (notification: any) => void) {
        if (this.isNative) {
            return await PushNotifications.addListener(eventName, listenerFunc);
        } else {
            if (!messaging) return;
            return onMessage(messaging, (payload) => {
                listenerFunc(payload);
            });
        }
    }

    // Helper to check permission state without requesting
    async checkPermissions(): Promise<NotificationPermissionStatus> {
        if (this.isNative) {
            const state = await PushNotifications.checkPermissions();
            return { granted: state.receive === 'granted' };
        } else {
            if (typeof window === 'undefined' || !('Notification' in window)) return { granted: false };
            return { granted: window.Notification.permission === 'granted' };
        }
    }
}

export const NotificationService = new NotificationServiceImpl();
