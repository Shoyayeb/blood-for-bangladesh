import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStateField() {
    try {
        console.log('🔍 Checking State Field Issue...\n');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                city: true,
                state: true,
                phoneNumber: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        console.log('📊 State field values for all users:');
        users.forEach((user, index) => {
            const userType = user.id.startsWith('test-user-') ? 'TEST' : 'REAL';
            console.log(`${index + 1}. ${user.name} (${userType})`);
            console.log(`   City: "${user.city}"`);
            console.log(`   State: "${user.state}"`);
            console.log(`   Phone: ${user.phoneNumber}`);
            console.log('');
        });

        // Test different search combinations
        console.log('🧪 Testing different search combinations:');

        const searchTests = [
            { city: 'Dhaka', state: 'Dhaka Division' },
            { city: 'Dhaka', state: 'Dhaka' },
            { city: 'Dhaka' }, // No state filter
            {}, // No filters
        ];

        for (const filters of searchTests) {
            const where = {
                profileVisibility: 'PUBLIC',
                isDonationPaused: false,
                isActive: true,
                ...filters
            };

            const results = await prisma.user.count({ where });

            const filterDesc = Object.entries(filters)
                .map(([key, value]) => `${key}="${value}"`)
                .join(', ') || 'No filters';

            console.log(`   ${filterDesc}: ${results} users`);
        }

        console.log('\n✅ State field analysis completed!');

    } catch (error) {
        console.error('❌ Analysis failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the analysis
checkStateField()
    .then(() => {
        console.log('\n🎉 Analysis completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Analysis failed:', error);
        process.exit(1);
    });
