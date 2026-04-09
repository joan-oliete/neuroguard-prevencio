import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const checkInactivity = onSchedule({
    schedule: 'every day 10:00',
    timeZone: 'Europe/Madrid',
}, async (event) => {
    const db = admin.firestore();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const dateString = threeDaysAgo.toISOString();

    try {
        // Query users inactive since dateString
        const usersSnapshot = await db.collection('users')
            .where('lastSeen', '<', dateString)
            .get();

        const tokens: string[] = [];
        usersSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            // Ensure they have a token and haven't opted out (if we had that logic)
            if (data.fcmToken) {
                tokens.push(data.fcmToken);
            }
        });

        if (tokens.length > 0) {
            const message = {
                notification: {
                    title: 'Et trobem a faltar! 👋',
                    body: 'Fa uns dies que no entrenes la teva ment. Torna per mantenir la teva ratxa!'
                },
                tokens: tokens
            };
            // Updated API for latest firebase-admin
            const response = await admin.messaging().sendEachForMulticast(message);
            logger.info(response.successCount + ' messages were sent successfully');
            if (response.failureCount > 0) {
                logger.warn(`${response.failureCount} messages failed to send.`);
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        logger.error(`Error sending to token ${tokens[idx]}:`, resp.error);
                    }
                });
            }
        } else {
            logger.info("No inactive users found to notify.");
        }
    } catch (error) {
        logger.error("Error checking inactivity:", error);
    }
});

export const dailyMotivation = onSchedule({
    schedule: 'every day 10:00',
    timeZone: 'Europe/Madrid',
}, async (event) => {
    const db = admin.firestore();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateString = sevenDaysAgo.toISOString();

    try {
        // Query users active in the last 7 days (we want to motivate active users)
        const usersSnapshot = await db.collection('users')
            .where('lastSeen', '>=', dateString)
            .get();

        const messages: admin.messaging.Message[] = [];

        usersSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.fcmToken) {
                const name = data.name || 'Campió/ona';
                const streak = data.streak || 0;
                const level = data.level || 1;

                // Personalized message logic
                let title = `Bon dia, ${name}! ☀️`;
                let body = `Avui és un nou dia per cuidar-te.`;

                if (streak > 2) {
                    body = `Portes ${streak} dies seguits de ratxa! Segueix així per arribar al nivell ${level + 1}. 🔥`;
                } else if (streak > 0) {
                    body = `Has començat bé! Mantingues el ritme avui. 💪`;
                } else {
                    body = `Torna a connectar amb tu mateix avui. T'esperem al gimnàs mental! 🧠`;
                }

                messages.push({
                    notification: { title, body },
                    token: data.fcmToken
                });
            }
        });

        if (messages.length > 0) {
            // Batch send (up to 500 messages per batch)
            const response = await admin.messaging().sendEach(messages);
            logger.info(`${response.successCount} motivation messages sent successfully.`);
            if (response.failureCount > 0) {
                logger.warn(`${response.failureCount} messages failed to send.`);
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        // Attempting to log the error object structure
                        logger.error(`Error sending message ${idx}:`, resp.error);
                    }
                });
            }
        } else {
            logger.info("No active users found to motivate today.");
        }
    } catch (error) {
        logger.error("Error sending daily motivation:", error);
    }
});

export const nightlySummary = onSchedule({
    schedule: 'every day 21:00',
    timeZone: 'Europe/Madrid',
}, async (event) => {
    const db = admin.firestore();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const threeDaysAgoString = threeDaysAgo.toISOString();

        const usersSnapshot = await db.collection('users')
            .where('lastSeen', '>=', threeDaysAgoString)
            .get();

        const messages: admin.messaging.Message[] = [];

        usersSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.fcmToken) {
                const name = data.name || 'Company/a';
                const lastSeenStr = data.lastSeen;
                let activeToday = false;

                if (lastSeenStr) {
                    const lastSeenDate = new Date(lastSeenStr);
                    if (lastSeenDate >= startOfToday) {
                        activeToday = true;
                    }
                }

                let title = 'Bona nit! 🌙';
                let body = '';

                if (activeToday) {
                    body = `Gran feina avui, ${name}! Has cuidat la teva ment. Ara toca descansar. Recorda anar a dormir aviat per consolidar el que has après.`;
                } else {
                    body = `Avui t'hem trobat a faltar, però demà és un nou dia. Intenta descansar bé i dormir les hores necessàries. La teva salut mental t'ho agrairà.`;
                }

                if (new Date().getDay() === 0) { // Sunday
                    body += " Prepara't per una gran setmana!";
                }

                messages.push({
                    notification: { title, body },
                    token: data.fcmToken
                });
            }
        });

        if (messages.length > 0) {
            const response = await admin.messaging().sendEach(messages);
            logger.info(`${response.successCount} nightly summary messages sent.`);
            if (response.failureCount > 0) {
                logger.warn(`${response.failureCount} messages failed to send.`);
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        logger.error(`Error sending message ${idx}:`, resp.error);
                    }
                });
            }
        } else {
            logger.info("No active users for nightly summary.");
        }

    } catch (error) {
        logger.error("Error sending nightly summary:", error);
    }
});

// HTTP Function for testing notifications manually
export const testNotification = onRequest(async (req, res) => {
    const token = req.query.token as string;
    if (!token) {
        res.status(400).send("Missing 'token' query parameter.");
        return;
    }

    const message = {
        notification: {
            title: 'Test de Notificació',
            body: 'Si veus això, les notificacions funcionen correctament! 🎉'
        },
        token: token
    };

    try {
        const response = await admin.messaging().send(message);
        logger.info("Test notification sent successfully:", response);
        res.status(200).send(`Notification sent! Message ID: ${response}`);
    } catch (error) {
        logger.error("Error sending test notification:", error);
        res.status(500).send(`Error sending notification: ${error}`);
    }
});

