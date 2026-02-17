const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';
const CREDENTIALS = {
    st_id_canonical: 'test@gmail.com',
    password: '123456789'
};

async function runTest() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/login`, CREDENTIALS);
        const token = loginRes.data.token;
        console.log('✅ Login successful. Token obtained.');

        const headers = { Authorization: `Bearer ${token}` };

        console.log('\n2. Updating Profile Details...');
        const profileData = {
            title: 'นาย',
            first_name_th: 'ทดสอบ',
            last_name_th: 'ครับผม',
            first_name_en: 'Test',
            last_name_en: 'Krabpom',
            nickname: 'Tester',
            dob: '2000-01-01',
            gender: 'ชาย',
            nationality: 'ไทย',
            phone: '0812345678',
            email: 'test@gmail.com',
            line_id: 'test_line_id',
            address: '123/456 ถ.ทดสอบ แขวงทดสอบ เขตทดสอบ',
            province: 'กรุงเทพมหานคร',
            about_me: 'นี่คือข้อมูลทดสอบระบบครับ',
            profile_visibility: {
                email: false,
                phone: true,
                address: false
            }
        };
        await axios.put(`${BASE_URL}/profile/details`, profileData, { headers });
        console.log('✅ Profile details updated.');

        console.log('\n3. Adding Education...');
        const eduData = {
            level: 'ปริญญาตรี',
            institution: 'มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ',
            faculty: 'วิทยาศาสตร์และเทคโนโลยี',
            program: 'วิทยาการคอมพิวเตอร์',
            start_year: 2018,
            end_year: 2022,
            gpa: 3.50
        };
        await axios.post(`${BASE_URL}/profile/education`, eduData, { headers });
        console.log('✅ Education added.');

        console.log('\n4. Updating Socials...');
        const socialData = {
            socials: [
                { platform: 'Facebook', url: 'https://facebook.com/testuser', is_visible: true },
                { platform: 'GitHub', url: 'https://github.com/testuser', is_visible: true }
            ]
        };
        await axios.put(`${BASE_URL}/profile/socials`, socialData, { headers });
        console.log('✅ Socials updated.');

        console.log('\n🎉 ALL TESTS PASSED! Data populated successfully.');

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    }
}

runTest();
