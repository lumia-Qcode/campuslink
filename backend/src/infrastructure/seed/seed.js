/**
 * SEED SCRIPT
 * Run once: npm run seed
 *
 * Creates:
 *  - Admin user (username: admin, password: admin123)
 *  - Class level reference data is embedded in domain/application layer (no separate collection needed)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// Models
const UserModel    = require('../../adapters/out/mongodb/models/UserModel');
const StudentModel = require('../../adapters/out/mongodb/models/StudentModel');
const TeacherModel = require('../../adapters/out/mongodb/models/TeacherModel');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set. Copy .env.example to .env and fill in your Atlas URI.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // ── 1. Create Admin User ──────────────────────────────────────────────────
  const existingAdmin = await UserModel.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists — skipping admin creation.');
  } else {
    const admin = new UserModel({
      username: 'admin',
      password: 'admin123',   // hashed by pre-save hook
      role:     'admin',
      name:     'School Administrator',
    });
    await admin.save();
    console.log('✅ Admin user created');
    console.log('   Username : admin');
    console.log('   Password : admin123');
  }

  // ── 2. Verify login works ─────────────────────────────────────────────────
  const adminDoc  = await UserModel.findOne({ username: 'admin' });
  const passOk    = await adminDoc.comparePassword('admin123');
  console.log(`✅ Admin login test: ${passOk ? 'PASS' : 'FAIL'}`);

  console.log('\n🎉 Seed complete. You can now start the server with: npm run dev');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
