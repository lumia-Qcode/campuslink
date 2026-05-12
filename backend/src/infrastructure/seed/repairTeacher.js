/**
 * REPAIR SCRIPT — repairTeacherSections.js
 *
 * Run this ONCE to fix teachers whose assignedSections array is empty
 * but who actually have sections assigned in the Section collection.
 *
 * This happens when:
 *  - Sections were created before the assignedSections sync fix was applied
 *  - The admin got a duplicate-section error during assignment, so the
 *    addAssignedSection call was never reached
 *
 * Usage:
 *   cd backend
 *   node src/infrastructure/seed/repairTeacherSections.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../..', '.env') });
const mongoose      = require('mongoose');
const TeacherModel  = require('../../adapters/out/mongodb/models/TeacherModel');
const SectionModel  = require('../../adapters/out/mongodb/models/SectionModel');

async function repair() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const teachers = await TeacherModel.find().lean();

  for (const teacher of teachers) {
    // Find all sections that reference this teacher
    const sections = await SectionModel.find({ teacherId: teacher._id }).lean();

    if (sections.length === 0) {
      console.log(`  ⚪ ${teacher.name} — no sections in Section collection`);
      continue;
    }

    const sectionIds = sections.map(s => s._id);

    // Update teacher's assignedSections to match reality
    await TeacherModel.findByIdAndUpdate(teacher._id, {
      $set: { assignedSections: sectionIds },
    });

    const labels = sections.map(s => `${s.classId}-${s.section} (${s.subject})`).join(', ');
    console.log(`  ✓ ${teacher.name} — linked ${sections.length} section(s): ${labels}`);
  }

  console.log('\nDone. Restart your backend server now.');
  await mongoose.disconnect();
}

repair().catch(err => { console.error(err); process.exit(1); });
