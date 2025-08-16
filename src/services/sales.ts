import { collection, addDoc, getDocs, Timestamp, doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Sale {
  id?: string;
  date: Date;
  basketId: string;
  basketName?: string;
  basketSellPrice?: number; // ราคาขายตะกร้าขณะที่ขาย
  orderCount?: number; // จำนวนออเดอร์ที่ซื้อ (default: 1)
  customerName?: string;
  trackingNumber?: string;
  products: Array<{
    productId: string;
    productName: string;
    qty: number;
    priceAtSale: number; // ราคาต้นทุนขณะที่ขาย
  }>;
  totalCost?: number; // ต้นทุนรวม
  totalRevenue?: number; // รายได้รวม (basketSellPrice * orderCount * 0.9144)
  profit?: number; // กำไรขณะที่ขาย
}

export async function deleteSale(id: string) {
  try {
    const docRef = doc(db, "sales", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw new Error(`Failed to delete sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
