import connectDB from '../config/db.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    await connectDB();

    const adminEmail = 'monsanbrew@gmail.com';
    const adminPassword = 'Monsanbrew@2025';

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
        console.log('Admin user already exists:', existingAdmin.email);
        process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = new User({
        name: 'Admin',
        contactNumber: '09124567890',
        lotNo: '123',
        purok: '2',
        street: 'Tato',
        landmark: '',
        barangay: 'Barangay 2',
        municipality: 'Gasan',
        province: 'Marinduque',
        email: adminEmail,
        password: hashedPassword,
        isVerified: true,
        photo: '',
        role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created:', adminEmail);
    process.exit(0);
}

createAdmin().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
