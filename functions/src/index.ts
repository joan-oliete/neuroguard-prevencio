import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const dailyMotivation = onSchedule({
    schedule: 'every day 09:00',
    timeZone: 'Europe/Madrid',
}, async (event) => {
    const db = admin.firestore();

    try {
        // Obtenir tots els usuaris per enviar la motivació matinal
        const usersSnapshot = await db.collection('users').get();

        const messages: admin.messaging.Message[] = [];

        usersSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.fcmToken) {
                const name = data.name || 'Campió/ona';
                
                const title = `Bon dia, ${name}! ☀️`;
                const body = `Afronta el dia amb energia. Recorda que NeuroGuard és aquí per ajudar-te a mantenir els bons hàbits i el teu benestar. Som-hi! 🚀`;

                messages.push({
                    notification: { title, body },
                    token: data.fcmToken
                });
            }
        });

        if (messages.length > 0) {
            // L'enviament es fa en lots si és necessari, però sendEach gestiona l'array (màxim 500 missatges per crida recomanat, però el SDK actual ho pot segmentar).
            const response = await admin.messaging().sendEach(messages);
            logger.info(`${response.successCount} motivation messages sent successfully.`);
            if (response.failureCount > 0) {
                logger.warn(`${response.failureCount} messages failed to send.`);
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        logger.error(`Error sending message ${idx}:`, resp.error);
                    }
                });
            }
        } else {
            logger.info("No users found to motivate today.");
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
        // Obtenir tots els usuaris per avaluar si han entrat avui o no
        const usersSnapshot = await db.collection('users').get();

        const messages: admin.messaging.Message[] = [];

        const promises = usersSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            if (data.fcmToken) {
                const name = data.name || 'Company/a';
                let activeToday = false;

                try {
                    const diarySnap = await db.collection(`users/${doc.id}/diaryEntries`)
                        .where('createdAt', '>=', startOfToday)
                        .limit(1)
                        .get();
                    
                    if (!diarySnap.empty) {
                        activeToday = true;
                    } else {
                        const messagesSnap = await db.collection(`users/${doc.id}/therapist_messages`)
                            .where('createdAt', '>=', startOfToday)
                            .limit(1)
                            .get();
                        
                        if (!messagesSnap.empty) {
                            activeToday = true;
                        }
                    }
                } catch (err) {
                    logger.error(`Error checking activity for user ${doc.id}:`, err);
                }

                let title = 'Bona nit! 🌙';
                let body = '';

                if (activeToday) {
                    body = `Molt bona feina avui cuidant de tu, ${name}! Has dedicat temps al teu benestar i això porta grans beneficis. Ara toca descansar bé per consolidar l'aprenentatge. Ens veiem demà!`;
                } else {
                    body = `Avui no t'hem vist per aquí, però recorda que NeuroGuard és al teu costat sempre que ens necessitis per ajudar-te a estar millor. Descansa i demà serà un nou dia.`;
                }

                messages.push({
                    notification: { title, body },
                    token: data.fcmToken
                });
            }
        });

        await Promise.all(promises);

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
            logger.info("No users found for nightly summary.");
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

