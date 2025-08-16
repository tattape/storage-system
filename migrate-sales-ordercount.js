// Migration script to add orderCount field to existing sales
// Run: npm run migrate-sales-ordercount

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
config({ path: '.env' });

// Firebase Admin config
const serviceAccount = {
  type: "service_account",
  project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  client_email: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
  private_key: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin
let app;
try {
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
} catch (error) {
  // App might already be initialized
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  }, 'migration-ordercount-app');
}

const db = getFirestore(app);

async function migrateSalesOrderCount() {
  console.log('🚀 Starting sales orderCount migration...');
  
  try {
    // Get all sales
    const salesSnapshot = await db.collection('sales').get();
    console.log(`📊 Found ${salesSnapshot.docs.length} sales to check`);
    
    let updatedCount = 0;
    let skipCount = 0;
    
    for (const saleDoc of salesSnapshot.docs) {
      const saleData = saleDoc.data();
      const saleId = saleDoc.id;
      
      // Check if sale already has orderCount field
      if (saleData.orderCount !== undefined) {
        console.log(`⏭️  Skipping sale ${saleId} - already has orderCount`);
        skipCount++;
        continue;
      }
      
      console.log(`🔄 Processing sale ${saleId}...`);
      
      // Get basket data for recalculating revenue and profit
      let basketData = null;
      try {
        const basketDoc = await db.collection('baskets').doc(saleData.basketId).get();
        if (basketDoc.exists) {
          basketData = basketDoc.data();
        }
      } catch (error) {
        console.warn(`⚠️  Basket ${saleData.basketId} not found for sale ${saleId}`);
      }
      
      // Set orderCount to 1 (default for old sales)
      const orderCount = 1;
      
      // Recalculate revenue and profit with orderCount
      const basketSellPrice = saleData.basketSellPrice || basketData?.sellPrice || 0;
      const totalCost = saleData.totalCost || 0;
      const totalRevenue = basketSellPrice * orderCount * (1 - 0.0856);
      const profit = totalRevenue - totalCost;
      
      // Prepare update data
      const updateData = {
        orderCount: orderCount,
        totalRevenue: totalRevenue,
        profit: profit
      };
      
      // Update sale document
      await db.collection('sales').doc(saleId).update(updateData);
      
      console.log(`✅ Updated sale ${saleId}:`);
      console.log(`   - Order Count: ${orderCount}`);
      console.log(`   - Basket Sell Price: ฿${basketSellPrice.toLocaleString()}`);
      console.log(`   - Total Cost: ฿${totalCost.toLocaleString()}`);
      console.log(`   - Total Revenue: ฿${totalRevenue.toLocaleString()}`);
      console.log(`   - Profit: ฿${profit.toLocaleString()}`);
      
      updatedCount++;
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`✅ Updated: ${updatedCount} sales`);
    console.log(`⏭️  Skipped: ${skipCount} sales (already migrated)`);
    console.log(`📊 Total: ${salesSnapshot.docs.length} sales`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration
migrateSalesOrderCount().then(() => {
  console.log('🏁 Migration script finished');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Migration script failed:', error);
  process.exit(1);
});
