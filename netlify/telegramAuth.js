import admin from 'firebase-admin';
import crypto from 'crypto';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: import.meta.env.FIREBASE_PROJECT_ID,
            clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL,
            privateKey: import.meta.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

export async function handler(event) {  // Removed the `context` parameter
    try {
        const body = JSON.parse(event.body);
        const { id, first_name, last_name, auth_date, hash } = body;

        // Step 1: Verify Telegram data
        const secret = crypto.createHmac('sha256', import.meta.env.TELEGRAM_BOT_TOKEN).digest('hex');
        const dataCheckString = `auth_date=${auth_date}\nid=${id}`;
        const checkHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

        if (checkHash !== hash) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Unauthorized: Hash does not match" }),
            };
        }

        // Step 2: Check if the Firebase user exists or create a new user
        const telegramId = `telegram:${id}`;
        let userRecord;

        try {
            // Check if a user with this Telegram ID already exists
            userRecord = await admin.auth().getUserByEmail(telegramId);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // If not, create a new user
                userRecord = await admin.auth().createUser({
                    uid: telegramId,
                    displayName: `${first_name} ${last_name}`,
                });
            } else {
                throw error;
            }
        }

        // Step 3: Respond with success
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User linked/created successfully",
                userRecord,
            }),
        };

    } catch (error) {
        console.error('Error handling Telegram Auth:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
        };
    }
}
