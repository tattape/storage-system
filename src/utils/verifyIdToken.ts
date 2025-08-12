import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// ป้องกัน initialize ซ้ำและ initialize เฉพาะเมื่อมี env variables จริง
if (!getApps().length && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "dummy-project") {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function verifyIdToken(token: string) {
  // ถ้าไม่มี Firebase Admin SDK ให้ throw error สำหรับ build time
  if (!getApps().length) {
    throw new Error("Firebase Admin not initialized - build time only");
  }
  return getAuth().verifyIdToken(token);
}
