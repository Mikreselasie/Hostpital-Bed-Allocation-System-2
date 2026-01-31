const http = require('http');

const API_URL = 'http://localhost:5000/api';

async function request(url, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({
                status: res.statusCode,
                data: data ? JSON.parse(data) : null
            }));
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('--- Auth Verification Tests ---');

    // 1. Test Unprotected Access (Should Fail)
    console.log('\n[1] Testing access without token...');
    const res1 = await request(`${API_URL}/beds`);
    console.log(`Status: ${res1.status} (Expected: 401)`);
    if (res1.status === 401) console.log('✅ Correct: Access denied.');
    else console.log('❌ Failed: Access should be denied.');

    // 2. Test Login (Success)
    console.log('\n[2] Testing login with doc_01...');
    const res2 = await request(`${API_URL}/login`, 'POST', {
        username: 'doc_01',
        password: 'pass123'
    });
    console.log(`Status: ${res2.status} (Expected: 200)`);
    if (res2.status === 200 && res2.data.token) {
        console.log('✅ Correct: Login successful, token received.');
        const token = res2.data.token;

        // 3. Test Protected Access (Should Success)
        console.log('\n[3] Testing access with valid token...');
        const res3 = await request(`${API_URL}/beds`, 'GET', null, {
            'Authorization': `Bearer ${token}`
        });
        console.log(`Status: ${res3.status} (Expected: 200)`);
        if (res3.status === 200 && Array.isArray(res3.data)) {
            console.log(`✅ Correct: Access granted. Received ${res3.data.length} beds.`);
        } else console.log('❌ Failed: Access should be granted.');

    } else console.log('❌ Failed: Login unsuccessful.');

    // 4. Test Login (Failure)
    console.log('\n[4] Testing login with wrong credentials...');
    const res4 = await request(`${API_URL}/login`, 'POST', {
        username: 'doc_01',
        password: 'wrong_password'
    });
    console.log(`Status: ${res4.status} (Expected: 401)`);
    if (res4.status === 401) console.log('✅ Correct: Login denied.');
    else console.log('❌ Failed: Login should be denied.');

    console.log('\n--- Tests Complete ---');
}

runTests().catch(console.error);
