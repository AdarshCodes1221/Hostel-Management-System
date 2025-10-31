// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import your models
const User = require('./models/User');
const Hostel = require('./models/Hostel');
const Room = require('./models/Room');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

async function seed() {
  try {
    // Clear existing collections
    await User.deleteMany();
    await Hostel.deleteMany();
    await Room.deleteMany();

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@siu.edu.in',
      password: 'Admin123!',
      prn: 'ADMIN001',
      role: 'admin',
    });

    console.log('Admin user created:', admin.email);

    // Create hostels
    const hostels = await Hostel.insertMany([
      { 
        name: 'Voila Hostel', 
        location: 'North Campus', 
        floors: 5,
        description: 'Modern hostel with excellent facilities for students',
        address: '123 North Campus Road',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411001',
        phone: '020-12345678',
        email: 'voila@siu.edu.in'
      },
      { 
        name: 'Magnolia Hostel', 
        location: 'South Campus', 
        floors: 4,
        description: 'Comfortable hostel with a peaceful environment',
        address: '456 South Campus Avenue',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411002',
        phone: '020-23456789',
        email: 'magnolia@siu.edu.in'
      },
      { 
        name: 'Orchid Hostel', 
        location: 'East Campus', 
        floors: 6,
        description: 'Premium hostel with state-of-the-art amenities',
        address: '789 East Campus Boulevard',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411003',
        phone: '020-34567890',
        email: 'orchid@siu.edu.in'
      },
    ]);

    console.log('Hostels created:', hostels.map(h => h.name));

    // Create rooms for each hostel
    const rooms = [];
    hostels.forEach(hostel => {
      for (let floor = 1; floor <= hostel.floors; floor++) {
        for (let roomNum = 1; roomNum <= 5; roomNum++) {
          rooms.push({
            hostel: hostel._id,
            floor: floor,
            roomNumber: `${floor}0${roomNum}`,
            capacity: 2,
            type: roomNum === 1 ? 'Single' : roomNum <= 3 ? 'Double' : 'Triple',
            price: roomNum === 1 ? 5000 : roomNum <= 3 ? 4500 : 4000,
            amenities: ['WiFi', '24/7 Security', 'Housekeeping']
          });
        }
      }
    });

    await Room.insertMany(rooms);
    console.log('Rooms created:', rooms.length);

    console.log('✅ Database seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
