const prisma = require('./db');
const bcrypt = require('bcryptjs');

async function main() {
    try {
        // Upsert Admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: adminPassword,
                role: 'ADMIN',
            },
        });
        console.log('Admin user created:', admin.username);

        // Upsert Employee
        const empPassword = await bcrypt.hash('emp123', 10);
        const employee = await prisma.user.upsert({
            where: { username: 'employee1' },
            update: {},
            create: {
                username: 'employee1',
                password: empPassword,
                role: 'EMPLOYEE',
            },
        });
        console.log('Employee user created:', employee.username);

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
