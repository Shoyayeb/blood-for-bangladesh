import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugSearchIssue() {
    try {
        console.log('🔍 Debugging Search Issue...\n');

        // Check all users in database
        console.log('1️⃣ All Users in Database:');
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                phoneNumber: true,
                bloodGroup: true,
                zone: true,
                area: true,
                profileVisibility: true,
                isDonationPaused: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        console.log(`📊 Total users: ${allUsers.length}\n`);

        allUsers.forEach((user, index) => {
            const userType = user.id.startsWith('test-user-') ? 'TEST' : 'REAL';
            console.log(`${index + 1}. ${user.name} (${userType})`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Phone: ${user.phoneNumber}`);
            console.log(`   Blood: ${user.bloodGroup}`);
            console.log(`   Zone: ${user.zone || 'NULL'}`);
            console.log(`   Profile Visibility: ${user.profileVisibility}`);
            console.log(`   Donation Paused: ${user.isDonationPaused}`);
            console.log(`   Active: ${user.isActive}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('');
        });

        // Test search with no filters
        console.log('2️⃣ Testing Search with No Filters (should show all PUBLIC users):');
        const allSearchResults = await prisma.user.findMany({
            where: {
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

        console.log(`📊 Users visible in search: ${allSearchResults.length}`);
        allSearchResults.forEach((user, index) => {
            const userType = user.id.startsWith('test-user-') ? 'TEST' : 'REAL';
            console.log(`   ${index + 1}. ${user.name} (${userType}) - ${user.bloodGroup} - ${user.zone}`);
        });

        // Test specific blood group search
        console.log('\n3️⃣ Testing A+ Blood Search in Mirpur:');
        const aplusResults = await prisma.user.findMany({
            where: {
                bloodGroup: 'A_POSITIVE',
                zone: { contains: 'Mirpur', mode: 'insensitive' },
                profileVisibility: 'PUBLIC',
                isDonationPaused: false,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                phoneNumber: true,
                area: true,
                zone: true,
            },
        });

        console.log(`📊 A+ donors in Mirpur: ${aplusResults.length}`);
        aplusResults.forEach((user, index) => {
            const userType = user.id.startsWith('test-user-') ? 'TEST' : 'REAL';
            console.log(`   ${index + 1}. ${user.name} (${userType}) - ${user.phoneNumber}`);
        });

        // Check for any users with wrong settings
        console.log('\n4️⃣ Checking for Users with Issues:');

        const pausedUsers = allUsers.filter(u => u.isDonationPaused === true);
        const inactiveUsers = allUsers.filter(u => u.isActive === false);
        const privateUsers = allUsers.filter(u => u.profileVisibility !== 'PUBLIC');
        const noZoneUsers = allUsers.filter(u => !u.zone && !u.id.startsWith('test-user-'));

        console.log(`   🚫 Donation Paused: ${pausedUsers.length}`);
        pausedUsers.forEach(u => console.log(`      - ${u.name}`));

        console.log(`   😴 Inactive: ${inactiveUsers.length}`);
        inactiveUsers.forEach(u => console.log(`      - ${u.name}`));

        console.log(`   🔒 Non-Public Profile: ${privateUsers.length}`);
        privateUsers.forEach(u => console.log(`      - ${u.name} (${u.profileVisibility})`));

        console.log(`   📍 Missing Zone: ${noZoneUsers.length}`);
        noZoneUsers.forEach(u => console.log(`      - ${u.name}`));

        console.log('\n✅ Debug analysis completed!');

    } catch (error) {
        console.error('❌ Debug failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the debug
debugSearchIssue()
    .then(() => {
        console.log('\n🎉 Debug completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Debug failed:', error);
        process.exit(1);
    });
