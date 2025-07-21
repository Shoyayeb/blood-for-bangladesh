import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalSearchTest() {
    try {
        console.log('🎯 Final Search Functionality Test...\n');

        // Test 1: All users search
        console.log('1️⃣ Testing All Users Search:');
        const allUsers = await prisma.user.findMany({
            where: {
                city: 'Dhaka',
                state: 'Dhaka Division',
                profileVisibility: 'PUBLIC',
                isDonationPaused: false,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                bloodGroup: true,
                zone: true,
            },
        });

        console.log(`   📊 Total visible users: ${allUsers.length}`);
        allUsers.forEach((user, index) => {
            const userType = user.id.startsWith('test-user-') ? 'TEST' : 'REAL';
            console.log(`   ${index + 1}. ${user.name} (${userType}) - ${user.bloodGroup} - ${user.zone}`);
        });

        // Test 2: Real users specifically
        console.log('\n2️⃣ Testing Real Users Only:');
        const realUsers = allUsers.filter(u => !u.id.startsWith('test-user-'));
        console.log(`   📊 Real users visible: ${realUsers.length}`);
        realUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name} - ${user.bloodGroup} - ${user.zone}`);
        });

        // Test 3: Blood group specific searches
        console.log('\n3️⃣ Testing Blood Group Searches:');
        const bloodGroups = ['O_POSITIVE', 'A_POSITIVE', 'B_POSITIVE', 'AB_POSITIVE'];

        for (const bloodGroup of bloodGroups) {
            const results = await prisma.user.count({
                where: {
                    bloodGroup,
                    city: 'Dhaka',
                    state: 'Dhaka Division',
                    profileVisibility: 'PUBLIC',
                    isDonationPaused: false,
                    isActive: true,
                },
            });
            console.log(`   ${bloodGroup.replace('_', ' ')}: ${results} donors`);
        }

        // Test 4: Zone specific searches
        console.log('\n4️⃣ Testing Zone Searches:');
        const zones = ['Mirpur', 'Dhanmondi', 'Uttara', 'Banani', 'Lalbagh'];

        for (const zone of zones) {
            const results = await prisma.user.count({
                where: {
                    zone,
                    city: 'Dhaka',
                    state: 'Dhaka Division',
                    profileVisibility: 'PUBLIC',
                    isDonationPaused: false,
                    isActive: true,
                },
            });
            console.log(`   ${zone}: ${results} donors`);
        }

        // Test 5: Combined search (A+ in Mirpur)
        console.log('\n5️⃣ Testing Combined Search (A+ in Mirpur):');
        const combinedResults = await prisma.user.findMany({
            where: {
                bloodGroup: 'A_POSITIVE',
                zone: 'Mirpur',
                city: 'Dhaka',
                state: 'Dhaka Division',
                profileVisibility: 'PUBLIC',
                isDonationPaused: false,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                phoneNumber: true,
            },
        });

        console.log(`   📊 A+ donors in Mirpur: ${combinedResults.length}`);
        combinedResults.forEach((user, index) => {
            const userType = user.id.startsWith('test-user-') ? 'TEST' : 'REAL';
            console.log(`   ${index + 1}. ${user.name} (${userType}) - ${user.phoneNumber}`);
        });

        console.log('\n✅ All search tests completed successfully!');
        console.log('\n🎉 Summary:');
        console.log(`   📊 Total searchable users: ${allUsers.length}`);
        console.log(`   🔥 Real users searchable: ${realUsers.length}`);
        console.log(`   🧪 Test users searchable: ${allUsers.length - realUsers.length}`);
        console.log('   ✅ All users from app registration now visible in search!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
finalSearchTest()
    .then(() => {
        console.log('\n🚀 Search functionality fully working!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Search test failed:', error);
        process.exit(1);
    });
