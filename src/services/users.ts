import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface User {
  id?: string;
  email: string;
  role: "owner" | "editor" | "member";
  uid: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch {
    return null;
  }
}

// Create or update user
export async function createOrUpdateUser(userData: User): Promise<void> {
  try {
    const userRef = doc(db, "users", userData.uid);
    await setDoc(userRef, {
      ...userData,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw error;
  }
}

// Check if user is owner by email
export async function isUserOwner(email: string): Promise<boolean> {
  try {
    const user = await getUserByEmail(email);
    return user?.role === "owner";
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}
