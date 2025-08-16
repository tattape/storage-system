import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { createStockUpdateNotification, createLowStockWarning, createCriticalStockAlert } from "./notifications";

// CREATE basket + empty products
export async function createBasket(basket: { name: string; sellPrice: number; createdAt?: any }) {
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

// UPDATE basket info (name and sell price)
export async function updateBasket(id: string, updates: { name?: string; sellPrice?: number }) {
    const docRef = doc(db, "baskets", id);
    await updateDoc(docRef, updates);
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
export async function updateProductInBasket(
    basketId: string, 
    productId: string, 
    updatedFields: Partial<{ name: string; stock: number; minStock: number; price: number; packSize: number }>,
    source: 'stock_modal' | 'sales' = 'stock_modal'
) {
    const basketRef = doc(db, "baskets", basketId);
    const basketSnap = await getDoc(basketRef);
    if (!basketSnap.exists()) throw new Error("Basket not found");

    const basketData = basketSnap.data();
    const basketName = basketData?.name || "Unknown Basket";
    const products = basketData?.products || [];
    
    // Find the product to get its current state
    const productIndex = products.findIndex((p: any) => p.id === productId);
    if (productIndex === -1) throw new Error("Product not found");
    
    const currentProduct = products[productIndex];
    const updatedProduct = { ...currentProduct, ...updatedFields };
    
    products[productIndex] = updatedProduct;

    await updateDoc(basketRef, { products });

    // Check if this is a stock update and send notification
    if (updatedFields.stock !== undefined) {
        const oldStock = currentProduct.stock || 0;
        const newStock = updatedFields.stock;
        const minStock = updatedProduct.minStock || 0;
        
        if (oldStock !== newStock) {
            // Send stock update notification (only from stock modal)
            await createStockUpdateNotification(
                currentProduct.name,
                basketName,
                newStock > oldStock ? 'add' : 'remove',
                oldStock,
                newStock,
                productId,
                basketId,
                source,
                minStock
            );

            // Check stock level alerts (only from sales)
            if (newStock <= minStock) {
                // Critical: stock is at or below minimum - suggest closing basket
                await createCriticalStockAlert(
                    updatedProduct.name,
                    basketName,
                    newStock,
                    minStock,
                    productId,
                    basketId,
                    source
                );
            } else if (newStock <= minStock * 2) {
                // Warning: stock is running low (between minStock and minStock*2)
                await createLowStockWarning(
                    updatedProduct.name,
                    basketName,
                    newStock,
                    minStock,
                    productId,
                    basketId,
                    source
                );
            }
        }
    }
}

// DELETE product from basket
export async function deleteProductFromBasket(basketId: string, productId: string) {
    const basketRef = doc(db, "baskets", basketId);
    const basketSnap = await getDoc(basketRef);
    if (!basketSnap.exists()) throw new Error("Basket not found");

    const basketData = basketSnap.data();
    const products = basketData?.products || [];
    
    const filtered = products.filter((p: any) => p.id !== productId);

    await updateDoc(basketRef, { products: filtered });
}
