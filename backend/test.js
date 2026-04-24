const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
    try {
        console.log('--- Starting TrueOrigin API Tests ---');
        const timestamp = Date.now();
        // 1. Register Manufacturer (Admin)
        console.log('Registering Admin...');
        const adminRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Sony Electronics',
            email: `admin_${timestamp}@sony.com`,
            password: 'password123',
            role: 'admin'
        });
        const adminToken = adminRes.data.token;
        console.log('✅ Admin Registered');

        // 2. Register User (Buyer)
        console.log('Registering Buyer...');
        const buyerRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'John Doe',
            email: `john_${timestamp}@example.com`,
            password: 'password123',
            role: 'buyer'
        });
        const buyerToken = buyerRes.data.token;
        console.log('✅ Buyer Registered');

        // 3. Admin adds a product
        console.log('Admin adding product...');
        const productRes = await axios.post(`${API_URL}/products`, {
            name: 'PlayStation 5',
            description: 'Next-gen gaming console'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const productId = productRes.data._id;
        console.log('✅ Product Added:', productRes.data.name);

        // 4. Admin generates a unique code
        console.log('Admin generating unique code...');
        const codeRes = await axios.post(`${API_URL}/codes`, {
            productId: productId,
            retailerInfo: 'BestBuy'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const generatedCode = codeRes.data.code;
        console.log('✅ Code Generated:', generatedCode);

        // 5. Public / Home Page verifies the code
        console.log(`Verifying code: ${generatedCode}...`);
        const verifyRes = await axios.get(`${API_URL}/codes/verify/${generatedCode}`);
        console.log('✅ Verification Result:', verifyRes.data);

        // 6. Buyer purchases the product using the code
        console.log('Buyer purchasing product...');
        const orderRes = await axios.post(`${API_URL}/orders`, {
            code: generatedCode
        }, {
            headers: { Authorization: `Bearer ${buyerToken}` }
        });
        console.log('✅ Purchase Successful. Order ID:', orderRes.data._id);

        // 7. Verification again (should be locked)
        console.log(`Re-verifying code: ${generatedCode}...`);
        const verifyAgainRes = await axios.get(`${API_URL}/codes/verify/${generatedCode}`);
        console.log('✅ Verification Result (After Purchase):', verifyAgainRes.data);

        // 8. Register second buyer (Resale test)
        console.log('Registering Second Buyer...');
        const buyer2Res = await axios.post(`${API_URL}/auth/register`, {
            name: 'Jane Smith',
            email: `jane_${timestamp}@example.com`,
            password: 'password123',
            role: 'buyer'
        });
        const buyer2Token = buyer2Res.data.token;

        console.log('Second Buyer purchasing product (Resale)...');
        const order2Res = await axios.post(`${API_URL}/orders`, {
            code: generatedCode
        }, {
            headers: { Authorization: `Bearer ${buyer2Token}` }
        });
        console.log('✅ Resale Successful! Is Resale:', order2Res.data.isResale);

        console.log('\n--- All Tests Passed Successfully! ---');
    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    }
}

runTests();
