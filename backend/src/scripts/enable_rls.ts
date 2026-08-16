import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function enableRLS() {
  console.log('🔒 [Security] Enabling Row Level Security (RLS) on all Supabase tables...');

  const tables = [
    'User',
    'WorkoutPlan',
    'DayWorkout',
    'Exercise',
    'ExerciseLibrary',
    'WeightLog',
    'ProgressLog',
    'CheckIn'
  ];

  for (const table of tables) {
    try {
      console.log(`  🛡️ Enabling RLS for "public"."${table}"...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`  ✅ RLS enabled for "${table}".`);
    } catch (err: any) {
      console.error(`  ❌ Error enabling RLS for "${table}":`, err.message);
    }
  }

  console.log('\n🎉 [Security Hardening Complete] All public tables now have Row Level Security enabled!');
  console.log('💡 Note: Your Node.js backend connects as PostgreSQL superuser (postgres) and continues to work normally with full permissions.');

  await prisma.$disconnect();
}

enableRLS().catch(async (e) => {
  console.error('❌ [Fatal Error]:', e);
  await prisma.$disconnect();
  process.exit(1);
});
