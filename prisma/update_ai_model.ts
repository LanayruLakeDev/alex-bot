import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingPages() {
  console.log('🔄 Updating existing pages with default aiModel...');

  try {
    // Get all pages first
    const allPages = await prisma.page.findMany();
    
    console.log(`Found ${allPages.length} pages`);

    // Update each page individually
    let updated = 0;
    for (const page of allPages) {
      await prisma.page.update({
        where: { id: page.id },
        data: { aiModel: 'llama' }
      });
      updated++;
      console.log(`✅ Updated ${page.pageName} with aiModel: 'llama'`);
    }

    console.log(`\n✅ Updated ${updated} pages with default aiModel: 'llama'`);

    // List all pages to verify
    const updatedPages = await prisma.page.findMany({
      select: {
        pageName: true,
        aiModel: true
      }
    });

    console.log('\n📋 Current pages:');
    updatedPages.forEach(page => {
      console.log(`  - ${page.pageName}: ${page.aiModel}`);
    });

  } catch (error) {
    console.error('❌ Error updating pages:', error);
    process.exit(1);
  }
}

updateExistingPages()
  .then(() => {
    console.log('\n✅ Database update complete!');
  })
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
