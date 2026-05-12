require('dotenv').config({
  path: require('path').resolve(__dirname, '../../..', '.env')
});

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserModel = require('../../adapters/out/mongodb/models/UserModel');
const StudentModel = require('../../adapters/out/mongodb/models/StudentModel');

async function repair() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const students = await StudentModel.find().lean();
  let fixed = 0;

  for (const student of students) {
    // Check if linked user exists
    let userExists = false;

    if (student.userId) {
      userExists = !!(await UserModel.findById(student.userId).lean());
    }

    if (!userExists) {
      // Base username
      const username = (
        student.username ||
        student.name.split(' ')[0]
      )
        .toLowerCase()
        .trim();

      // Avoid duplicate usernames
      let finalUsername = username;
      let suffix = 1;

      while (
        await UserModel.findOne({ username: finalUsername }).lean()
      ) {
        finalUsername = `${username}${suffix++}`;
      }

      // Password = username + 123
      const rawPassword = `${finalUsername}123`;

      // Hash password
      const hash = await bcrypt.hash(rawPassword, 12);

      // Create user
      const user = await UserModel.create({
        username: finalUsername,
        password: hash,
        role: 'student',
        name: student.name,
      });

      // Update student document
      await StudentModel.findByIdAndUpdate(student._id, {
        userId: user._id,
        username: finalUsername,
      });

      console.log(
        `✓ Created user for "${student.name}" → username: ${finalUsername}, password: ${rawPassword}`
      );

      fixed++;
    }
  }

  console.log(`\nDone. Fixed ${fixed} student(s).`);

  await mongoose.disconnect();
}

repair().catch((err) => {
  console.error(err);
  process.exit(1);
});