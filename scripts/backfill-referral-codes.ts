// Script to backfill referral codes for existing users
// Run with: npx tsx scripts/backfill-referral-codes.ts

import { PrismaClient } from '../app/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { createId } from '@paralleldrive/cuid2';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function backfillReferralCodes() {
  console.log('🔄 Starting referral code backfill...\n');

  // Find all users without a referral code
  const usersWithoutCode = await prisma.user.findMany({
    where: {
      referralCode: null,
    },
    select: {
      id: true,
      twitterHandle: true,
    },
  });

  console.log(`Found ${usersWithoutCode.length} users without referral codes.\n`);

  if (usersWithoutCode.length === 0) {
    console.log('✅ All users already have referral codes!');
    return;
  }

  // Update each user with a unique referral code
  let successCount = 0;
  let errorCount = 0;

  for (const user of usersWithoutCode) {
    try {
      const referralCode = createId();
      
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode },
      });

      console.log(`✅ @${user.twitterHandle} → ${referralCode}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed for @${user.twitterHandle}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('='.repeat(50));
}

backfillReferralCodes()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
