const sequelize = require('./config/db');
const Student = require('./models/Student');
const MessManager = require('./models/MessManager');
const Menu = require('./models/Menu');

const seedData = async () => {
  try {
    // This connects to the DB and checks tables
    await sequelize.sync({ force: false }); 

    // 1. Add yourself as a test Student
    await Student.findOrCreate({
      where: { rollNo: '240252' },
      defaults: {
        name: 'B Mahath',
        email: 'bmahath24@iitk.ac.in',
        password: 'password123',
        roomNo: 'B-101'
      }
    });

    // 2. Add Siddhant as a Mess Manager
    await MessManager.findOrCreate({
      where: { adminId: 'ADMIN01' },
      defaults: {
        name: 'Siddhant Singh',
        password: 'adminpassword',
        role: 'Manager'
      }
    });

    // 3. Add a sample Menu item
    await Menu.create({
      date: new Date(),
      mealType: 'Lunch',
      items: 'Paneer Butter Masala, Roti, Rice, Dal Fry',
      voteCount: 5
    });

    console.log('🌱 Database seeded successfully with test data!');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();