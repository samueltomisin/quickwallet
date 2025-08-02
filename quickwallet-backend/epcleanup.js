#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');

// Configuration
const config = {
  dbUri: process.env.MONGO_URI,
  cleanupActions: {
    normalizeEmails: true,    // Convert emails to lowercase
    trimNames: true,         // Remove whitespace from names
    hashPasswords: false,    // Set to true to re-hash passwords
    deleteInvalid: true      // Remove completely invalid records
  },
  batchSize: 100,
  dryRun: false
};

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
}

// Main cleanup function
async function cleanupUsers() {
  const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: String,
    walletBalance: { type: Number, default: 0 },
  }, { timestamps: true }); // Make sure your User model is registered
  
  // Define cleanup criteria
  const invalidRecordsQuery = {
    $or: [
      { email: { $exists: true } },
      { email: null },
      { email: { $regex: /^\s*$/ } },  // Empty or whitespace-only
      { fullName: { $exists: true } },
      { fullName: null },
      { password: { $exists: true } },
      { password: null },
      { password: { $regex: /^\s*$/ } }
    ]
  };

  try {
    // Count affected records
    const totalCount = await User.countDocuments(invalidRecordsQuery);
    console.log(`🔍 Found ${totalCount} records needing cleanup`);

    if (config.dryRun) {
      console.log('🧪 DRY RUN - No changes will be made');
      const sample = await User.find(invalidRecordsQuery).limit(3);
      console.log('Sample records:', JSON.stringify(sample, null, 2));
      return;
    }

    // Process in batches
    let processed = 0;
    while (processed < totalCount) {
      const batch = await User.find(invalidRecordsQuery)
        .skip(processed)
        .limit(config.batchSize);

      if (batch.length === 0) break;

      for (const user of batch) {
        // Clean email
        if (config.cleanupActions.normalizeEmails && user.email) {
          user.email = user.email.toLowerCase().trim();
        }

        // Clean fullName
        if (config.cleanupActions.trimNames && user.fullName) {
          user.fullName = user.fullName.trim().replace(/\s+/g, ' ');
        }

        // Clean password
        if (config.cleanupActions.hashPasswords && user.password) {
          if (!user.password.startsWith('$2a$')) { // If not already hashed
            user.password = await bcrypt.hash(user.password, 10);
          }
        }

        // Validate if record should be kept
        const isValid = user.email && 
                        user.fullName && 
                        user.password &&
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);

        if (!isValid && config.cleanupActions.deleteInvalid) {
          await user.deleteOne();
          console.log(`🗑️ Deleted invalid record: ${user._id}`);
        } else {
          await user.save();
          console.log(`♻️ Cleaned record: ${user._id}`);
        }

        processed++;
        process.stdout.write(`\r📊 Progress: ${processed}/${totalCount}`);
      }
    }

    console.log(`\n✅ Cleanup completed! Processed ${processed} records`);
  } catch (err) {
    console.error('\n❌ Cleanup failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Execute the cleanup
(async () => {
  await connectDB();
  await cleanupUsers();
})();