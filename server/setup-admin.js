// Setup script to create a default admin user
const bcrypt = require('bcryptjs');
const Admin = require('./src/models/Admin.js');

const createDefaultAdmin = async () => {
  try {
    // Create admin table first
    await Admin.createTable();
    
    // Check if admin already exists
    const existingAdmin = await Admin.findByUsername('admin');
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminId = await Admin.create({
      username: 'admin',
      email: 'admin@example.com',
      password_hash: hashedPassword,
      full_name: 'System Administrator',
      role: 'superadmin',
      status: 'active'
    });
    
    console.log('✅ Default admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Admin ID:', adminId);
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  }
  
  process.exit(0);
};

createDefaultAdmin();
