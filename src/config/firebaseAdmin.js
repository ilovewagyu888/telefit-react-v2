import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccountKey.json'; // Make sure this path is correct

// Initialize Firebase Admin SDK
const adminApp = initializeApp({
  credential: cert(serviceAccount),
});

const adminDb = getFirestore(adminApp);

export { adminDb };