import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

// CREATE basket + empty products
export async function createBasket(basket: { name: string; createdAt?: any }) {
    const docRef = await addDoc(collection(db, "baskets"), {
        ...basket,
        createdAt: basket.createdAt || Timestamp.now(),
        products: []
    });
    return docRef.id;
}

// READ all baskets
export async function getAllBaskets() {
    const querySnapshot = await getDocs(collection(db, "baskets"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// READ basket by id
export async function getBasketById(id: string) {
    const docRef = doc(db, "baskets", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Basket not found");
    return { id: docSnap.id, ...docSnap.data() };
}

// UPDATE basket name
export async function updateBasketName(id: string, newName: string) {
    const docRef = doc(db, "baskets", id);
    await updateDoc(docRef, { name: newName });
}

// DELETE basket
export async function deleteBasket(id: string) {
    const docRef = doc(db, "baskets", id);
    await deleteDoc(docRef);
}

// ADD product to basket
export async function addProductToBasket(basketId: string, product: { name: string; stock: number; minStock: number; price: number; packSize: number }) {
    const basketRef = doc(db, "baskets", basketId);
    const basketSnap = await getDoc(basketRef);
    if (!basketSnap.exists()) throw new Error("Basket not found");

    const basketData = basketSnap.data();
    const products = basketData?.products || [];

    // สร้าง product id แบบ timestamp
    const newProduct = {
        id: Date.now().toString(),
        ...product
    };

    products.push(newProduct);

    await updateDoc(basketRef, { products });
    return newProduct;
}

// UPDATE product in basket
export async function updateProductInBasket(basketId: string, productId: string, updatedFields: Partial<{ name: string; stock: number; minStock: number; price: number; packSize: number }>) {
    const basketRef = doc(db, "baskets", basketId);
    const basketSnap = await getDoc(basketRef);
    if (!basketSnap.exists()) throw new Error("Basket not found");

    let products = basketSnap.data()?.products || [];
    products = products.map((p: any) => (p.id === productId ? { ...p, ...updatedFields } : p));

    await updateDoc(basketRef, { products });
}

// DELETE product from basket
export async function deleteProductFromBasket(basketId: string, productId: string) {
    const basketRef = doc(db, "baskets", basketId);
    const basketSnap = await getDoc(basketRef);
    if (!basketSnap.exists()) throw new Error("Basket not found");

    const products = basketSnap.data()?.products || [];
    const filtered = products.filter((p: any) => p.id !== productId);

    await updateDoc(basketRef, { products: filtered });
}
