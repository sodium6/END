const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Admin = require('./src/models/Admin');
const pool = require('./src/db/database');

async function main() {
    try {
        console.log('Ensuring default admin...');
        const result = await Admin.ensureDefaultAdmin();
        console.log('Result:', result);

        const admin = await Admin.findByUsername('admin');
        if (admin) {
            console.log('Admin user verified:', admin.username);
            console.log('Role:', admin.role);
            console.log('Status:', admin.status);
        } else {
            console.error('Failed to find admin user after ensure.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

main();
