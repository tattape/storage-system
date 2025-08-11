import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
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

// Get user by UID
export async function getUserByUid(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (userDoc.exists()) {
      const docData = userDoc.data();
      
      const userData = { 
        id: userDoc.id, 
        uid: uid,
        email: docData.email || "",
        role: docData.role || "member",
        ...docData 
      } as User;
      
      return userData;
    }
    return null;
  } catch (error) {
    console.error("Error getting user by UID:", error);
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

// Check if user is owner
export async function isUserOwner(uid: string): Promise<boolean> {
  try {
    const user = await getUserByUid(uid);
    return user?.role === "owner";
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}
