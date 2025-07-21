import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
    try {
        console.log('🧹 Starting database cleanup...');

        // Delete data in the correct order (respecting foreign key constraints)
        console.log('Deleting notifications...');
        await prisma.notification.deleteMany({});

        console.log('Deleting blood requests...');
        await prisma.bloodRequest.deleteMany({});

        console.log('Deleting donations...');
        await prisma.donation.deleteMany({});

        console.log('Deleting users...');
        await prisma.user.deleteMany({});

        console.log('✅ Database cleared successfully!');
        console.log('📊 All development data has been removed.');

        // Optional: Reset any auto-increment sequences if needed
        console.log('🔄 Database is ready for production data.');

    } catch (error) {
        console.error('❌ Error clearing database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the cleanup
clearDatabase()
    .then(() => {
        console.log('🎉 Database cleanup completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Database cleanup failed:', error);
        process.exit(1);
    });
