// Use the same prisma instance as the backend
const prisma = require('./src/config/prisma').default;

async function debugWalkIns() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    console.log('=== DEBUG WALK-INS ===');
    console.log('Date range:', startOfDay.toISOString(), 'to', endOfDay.toISOString());
    console.log('');
    
    // Get wellness plans created today
    const wellnessPlans = await prisma.wellnessPlan.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            centerId: true,
            center: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    console.log('--- WELLNESS PLANS TODAY ---');
    console.log(`Found ${wellnessPlans.length} wellness plans`);
    wellnessPlans.forEach((plan, i) => {
      console.log(`${i + 1}. User: ${plan.user.fullName} (ID: ${plan.userId})`);
      console.log(`   Center: ${plan.user.center?.name || 'N/A'} (ID: ${plan.user.centerId || 'N/A'})`);
      console.log(`   Created: ${plan.createdAt.toISOString()}`);
    });
    console.log('');
    
    // Get appointments today
    const appointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            centerId: true
          }
        }
      }
    });
    
    console.log('--- APPOINTMENTS TODAY ---');
    console.log(`Found ${appointments.length} appointments`);
    appointments.forEach((apt, i) => {
      console.log(`${i + 1}. User: ${apt.user.fullName} (ID: ${apt.userId})`);
      console.log(`   Center ID: ${apt.user.centerId || 'N/A'}`);
      console.log(`   Scheduled: ${apt.scheduledAt.toISOString()}`);
      console.log(`   Status: ${apt.status}`);
    });
    console.log('');
    
    // Calculate walk-ins manually
    console.log('--- WALK-IN CALCULATION ---');
    const appointmentDateMap = new Map();
    appointments.forEach((apt) => {
      const dayKey = apt.scheduledAt.toISOString().split('T')[0];
      const existing = appointmentDateMap.get(apt.userId) || new Set();
      existing.add(dayKey);
      appointmentDateMap.set(apt.userId, existing);
    });
    
    let walkInCount = 0;
    console.log('Checking each wellness plan:');
    wellnessPlans.forEach((plan, i) => {
      const planDayKey = plan.createdAt.toISOString().split('T')[0];
      const userAppointments = appointmentDateMap.get(plan.userId);
      const hasAppointment = userAppointments && userAppointments.has(planDayKey);
      const isWalkIn = !hasAppointment;
      
      console.log(`${i + 1}. ${plan.user.fullName}:`);
      console.log(`   Plan date: ${planDayKey}`);
      console.log(`   Has appointment same day: ${hasAppointment ? 'YES' : 'NO'}`);
      console.log(`   Is walk-in: ${isWalkIn ? 'YES' : 'NO'}`);
      
      if (isWalkIn) walkInCount++;
    });
    
    console.log('');
    console.log(`TOTAL WALK-INS: ${walkInCount}`);
    
    // Check nurse user
    console.log('');
    console.log('--- NURSE USER INFO ---');
    const nurses = await prisma.user.findMany({
      where: {
        role: 'NURSE_OFFICER'
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        centerId: true,
        center: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    nurses.forEach((nurse) => {
      console.log(`Nurse: ${nurse.fullName} (${nurse.email})`);
      console.log(`Center: ${nurse.center?.name || 'N/A'} (ID: ${nurse.centerId || 'N/A'})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugWalkIns();
