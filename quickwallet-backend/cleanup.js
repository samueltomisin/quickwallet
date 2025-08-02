require('dotenv').config({ path: '.env' });

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Wallet = require('./models/Wallet'); // Adjust path as needed

// Configuration
const config = {
  dbUri: process.env.MONGO_URI,
  dryRun: true, // Set to true to test without changes
  action: 'delete', // Options: 'delete', 'unset', 'regenerate'
  batchSize: 100 // Process documents in batches
};

async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find problematic documents
    const query = { userId: null };
    const totalCount = await Wallet.countDocuments(query);
    
    if (totalCount === 0) {
      console.log('✅ No problematic documents found');
      return;
    }

    console.log(` Found ${totalCount} documents with issues`);

    if (config.dryRun) {
      console.log('🚧 DRY RUN MODE - No changes will be made');
      const sample = await Wallet.find(query).limit(3);
      console.log('Sample documents:', sample);
      return;
    }

    // Process in batches
    let processed = 0;
    while (processed < totalCount) {
      const batch = await Wallet.find(query)
        .skip(processed)
        .limit(config.batchSize);

      if (batch.length === 0) break;

      for (const doc of batch) {
        switch (config.action) {
          case 'delete':
            await doc.remove();
            break;
          case 'unset':
            doc.userId = undefined;
            await doc.save();
            break;
          case 'regenerate':
            doc.userId = uuidv4();
            await doc.save();
            break;
        }
        processed++;
        process.stdout.write(`\r🔄 Processed ${processed}/${totalCount} documents`);
      }
    }

    console.log('\n✅ Cleanup completed successfully');
    console.log(`Total documents processed: ${processed}`);

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupDatabase();