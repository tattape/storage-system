import { collection, addDoc, getDocs, Timestamp, doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Sale {
  id?: string;
  date: Date;
  basketId: string;
  customerName?: string;
  trackingNumber?: string;
  products: Array<{
    productId: string;
    productName: string;
    qty: number;
  }>;
}

export async function deleteSale(id: string) {
  const docRef = doc(db, "sales", id);
  await deleteDoc(docRef);
}

export async function addSale(sale: Omit<Sale, "id">) {
  const docRef = await addDoc(collection(db, "sales"), {
    ...sale,
    date: Timestamp.fromDate(sale.date),
    // products: array of { productId, productName, qty }
  });
  return docRef.id;
}

export async function getAllSales(): Promise<Sale[]> {
  const querySnapshot = await getDocs(collection(db, "sales"));
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate() : new Date(),
      products: Array.isArray(data.products) ? data.products : [],
    } as Sale;
  });
}

export async function getSalesByDateRange(start: Date, end: Date) {
  const q = query(
    collection(db, "sales"),
    where("date", ">=", Timestamp.fromDate(start)),
    where("date", "<=", Timestamp.fromDate(end))
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate() : new Date(),
      products: Array.isArray(data.products) ? data.products : [],
    };
  });
}
