const bcrypt = require('bcryptjs');
const { User, Entity, EmailRecipient } = require('../models');

const seedData = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Create default users
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const users = await User.bulkCreate([
      {
        email: 'admin@company.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      },
      {
        email: 'finance@company.com',
        name: 'Finance Manager',
        password: await bcrypt.hash('Finance@123', 10),
        role: 'finance',
        isActive: true
      },
      {
        email: 'user@company.com',
        name: 'Department User',
        password: await bcrypt.hash('User@123', 10),
        role: 'department_user',
        department: 'Operations',
        isActive: true
      }
    ]);

    console.log('✅ Users created');

    // Create entities
    const entities = await Entity.bulkCreate([
      {
        name: 'National Group',
        code: 'NG',
        description: 'National Group Company',
        isActive: true
      },
      {
        name: 'Rainland Auto Corp',
        code: 'RAC',
        description: 'Rainland Auto Corporation',
        isActive: true
      },
      {
        name: 'Junobo Hotels',
        code: 'JH',
        description: 'Junobo Hotels Chain',
        isActive: true
      },
      {
        name: 'iSky',
        code: 'ISK',
        description: 'iSky Corporation',
        isActive: true
      },
      {
        name: 'Other Group Companies',
        code: 'OGC',
        description: 'Other Group Companies',
        isActive: true
      }
    ]);

    console.log('✅ Entities created');

    // Create email recipients
    const recipients = await EmailRecipient.bulkCreate([
      {
        email: 'finance@company.com',
        name: 'Finance Team',
        isActive: true
      },
      {
        email: 'admin@company.com',
        name: 'Admin Team',
        isActive: true
      }
    ]);

    console.log('✅ Email recipients created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Default login credentials:');
    console.log('Admin: admin@company.com / Admin@123');
    console.log('Finance: finance@company.com / Finance@123');
    console.log('Department User: user@company.com / User@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
