require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const { User, AboutUs, Category } = require('./models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database successfully.');

    // Seed default Admin User
    const adminUsername = 'admin';
    const adminEmail = 'admin@ptgibran.com';
    const plainPassword = 'adminpassword123';

    const existingUser = await User.scope('withPassword').findOne({
      where: { username: adminUsername }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      await User.create({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
      });
      console.log(`✅ Default admin created: username="${adminUsername}", password="${plainPassword}"`);
    } else {
      console.log(`ℹ️ Admin user "${adminUsername}" already exists.`);
    }

    // Seed default AboutUs
    const existingAbout = await AboutUs.findOne();
    if (!existingAbout) {
      await AboutUs.create({
        company_name: 'PT Gibran / CMS Gobana Company',
        description: 'Perusahaan terpercaya bidang konstruksi dan layanan profesional.',
        vision: 'Menjadi mitra konstruksi dan penyedia produk terkemuka.',
        mission: 'Memberikan layanan berkualitas tinggi dan solusi inovatif.',
        address: 'Jl. Utama No. 123, Jakarta',
        phone: '021-5551234',
        email: 'info@ptgibran.com',
      });
      console.log('✅ Default AboutUs created.');
    }

    // Seed default Categories
    const catCount = await Category.count();
    if (catCount === 0) {
      await Category.bulkCreate([
        { name: 'Konstruksi & Bangunan', slug: 'konstruksi-bangunan', type: 'PRODUCT' },
        { name: 'Desain Arsitektur', slug: 'desain-arsitektur', type: 'PRODUCT' },
        { name: 'Berita Perusahaan', slug: 'berita-perusahaan', type: 'NEWS' },
        { name: 'Pengumuman', slug: 'pengumuman', type: 'NEWS' },
      ]);
      console.log('✅ Default categories created.');
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
