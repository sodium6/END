require('dotenv').config({ path: '../.env' }); // Adjust path if needed, but usually default load is fine if env vars are system wide or .env in root
const User = require('../models/User');
const UserEducation = require('../models/UserEducation');
const UserSocial = require('../models/UserSocial');
const pool = require('../db/database');

const migrate = async () => {
    try {
        console.log('Migrating Database...');
        await User.createTable();
        console.log('User table updated.');
        await UserEducation.createTable();
        console.log('UserEducation table created.');
        await UserSocial.createTable();
        console.log('UserSocial table created.');
        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
