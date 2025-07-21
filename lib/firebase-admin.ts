import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import * as path from 'path';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    const firebaseConfig: {
      projectId?: string;
      credential?: ReturnType<typeof cert>;
    } = {
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };

    // Try to use service account JSON file first
    try {
      const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
      const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountFile);
      
      firebaseConfig.credential = cert(serviceAccount);
      console.log('Firebase Admin initialized with service account JSON file');
    } catch {
      console.log('Service account JSON file not found, trying environment variables...');
      // Fallback to environment variables (required for Vercel deployment)
      if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        firebaseConfig.credential = cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
        console.log('Firebase Admin initialized with service account environment variables');
      } else {
        console.warn('Warning: No Firebase service account credentials found.');
        console.warn('For production deployment, make sure to set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables.');
        // For development, try to use Application Default Credentials
        console.log('Firebase Admin initialized with default credentials (development mode)');
      }
    }

    initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export const adminAuth = getAuth();

// Utility function to verify Firebase token
export async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      success: true,
      user: decodedToken,
      phoneNumber: decodedToken.phone_number,
      uid: decodedToken.uid,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return {
      success: false,
      error: 'Invalid token',
    };
  }
}
