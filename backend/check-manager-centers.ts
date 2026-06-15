import { prisma } from './src/config/prisma';

async function checkManagers() {
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: {
        id: true,
        fullName: true,
        email: true,
        centerId: true,
        center: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
      },
    });

    console.log('\n=== MANAGERS IN DATABASE ===\n');
    managers.forEach((manager) => {
      console.log(`Name: ${manager.fullName}`);
      console.log(`Email: ${manager.email}`);
      console.log(`Center ID: ${manager.centerId || 'NOT SET'}`);
      if (manager.center) {
        console.log(`Center Name: ${manager.center.name}`);
        console.log(`Center Region: ${manager.center.region}`);
      } else {
        console.log('Center: NOT ASSIGNED');
      }
      console.log('---\n');
    });

    console.log(`\nTotal managers: ${managers.length}`);
    console.log(`Managers without center: ${managers.filter((m) => !m.centerId).length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkManagers();
