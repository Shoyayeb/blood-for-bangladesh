import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStateField() {
    try {
        console.log('🔄 Fixing State Field Consistency...\n');

        // Find users with inconsistent state values
        const usersWithWrongState = await prisma.user.findMany({
            where: {
                city: 'Dhaka',
                state: 'Dhaka', // Wrong value, should be "Dhaka Division"
            },
            select: {
                id: true,
                name: true,
                city: true,
                state: true,
                phoneNumber: true,
            },
        });

        console.log(`📊 Found ${usersWithWrongState.length} users with incorrect state:`)
        usersWithWrongState.forEach((user, index) => {
            const userType = user.id.startsWith('test-user-') ? 'TEST' : 'REAL';
            console.log(`${index + 1}. ${user.name} (${userType})`);
            console.log(`   Current State: "${user.state}"`);
            console.log(`   Phone: ${user.phoneNumber}`);
        });

        if (usersWithWrongState.length === 0) {
            console.log('✅ All users already have correct state values.');
            return;
        }

        // Update the state field
        console.log('\n🔧 Updating state field...');
        const updateResult = await prisma.user.updateMany({
            where: {
                city: 'Dhaka',
                state: 'Dhaka',
            },
            data: {
                state: 'Dhaka Division',
            },
        });

        console.log(`✅ Updated ${updateResult.count} users to state "Dhaka Division"`);

        // Verify the fix
        console.log('\n📋 Verification:');
        const allUsers = await prisma.user.findMany({
            where: { city: 'Dhaka' },
            select: {
                name: true,
                state: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}: ${user.state}`);
        });

        console.log('\n🎉 State field consistency fix completed!');

    } catch (error) {
        console.error('❌ Fix failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the fix
fixStateField()
    .then(() => {
        console.log('\n✨ State field fix completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 State field fix failed:', error);
        process.exit(1);
    });
