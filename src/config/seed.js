/** Seed baseline content (idempotent-ish). Run: npm run seed */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('../models/User');
const History = require('../models/History');
const KeyArea = require('../models/KeyArea');

async function main() {
  await connectDB(process.env.MONGO_URI);

  const email = 'admin@gmail.com';
  let admin = await User.findOne({ email });
  if (!admin) {
    const password = await bcrypt.hash('Admin123', 10);
    admin = await User.create({ fullname: 'Admin', username: 'admin', email, password, image: null });
    console.log('Seeded admin user: admin@gmail.com / Admin123');
  } else console.log('Admin user already exists:', email);

  if ((await History.countDocuments()) === 0) {
    await History.create({
      vision: 'To become a leading international advisory firm advancing climate-resilient development, intelligent agriculture, and sustainable infrastructure transformation in Bangladesh.',
      mission: 'To integrate Development, Environment, Livelihood, Transportation & Advocacy into a unified, technology-driven framework.',
      contain: 'DELTA International is an international consulting and advisory firm established in 2020 and headquartered in Dhaka, Bangladesh.',
    });
    console.log('Seeded history/vision record');
  }

  if ((await KeyArea.countDocuments()) === 0) {
    await KeyArea.insertMany([
      { header: 'Water & Wastewater Treatment Systems (ETP / STP / WTP)', content: 'Design and development of Effluent Treatment Plants (ETP), Sewage Treatment Plants (STP), Water Treatment Plants (WTP).' },
      { header: 'Environmental Assessment & Compliance', content: 'IEE, EIA, ESIA, EMP, compliance audit and regulatory reporting (ECR, DoE Bangladesh).' },
      { header: 'Engineering Design, Review & Documentation', content: 'Detailed process design, design checking, tender documents, BOQ, AutoCAD drawings.' },
      { header: 'Digital Monitoring & Smart Systems (AI & IoT Integration)', content: 'IoT-based water quality monitoring, AI-driven process optimization, real-time dashboards.' },
    ]);
    console.log('Seeded key areas');
  }

  console.log('Seed done.');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
