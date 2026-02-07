// Using native fetch (Node 18+)

const BASE_URL = 'http://localhost:5000/api';
const timestamp = Date.now();
const testUser = {
    email: `verify_${timestamp}@example.com`,
    password: 'Password123',
    username: `vuser_${timestamp}`
};

async function verify() {
    console.log('--- Phase 1: Sign up ---');
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
    });
    const signupData = await signupRes.json();
    console.log('Signup Result:', signupData);

    if (!signupData.success) throw new Error('Signup failed');

    console.log('\n--- Phase 2: Sign in ---');
    const signinRes = await fetch(`${BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const signinData = await signinRes.json();
    console.log('Signin Result:', signinData);

    const token = signinData.token;
    if (!token) throw new Error('Signin failed, no token');

    console.log('\n--- Phase 3: Check Analytics (Initial) ---');
    const analyticsRes1 = await fetch(`${BASE_URL}/users/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const analyticsData1 = await analyticsRes1.json();
    console.log('Initial Analytics Response:', analyticsData1);

    if (!analyticsRes1.ok) throw new Error(`Analytics initial fetch failed: ${analyticsRes1.status} ${JSON.stringify(analyticsData1)}`);
    if (!analyticsData1.analytics) throw new Error('Analytics data missing from response');

    console.log('Initial Stats:', JSON.stringify(analyticsData1.analytics.stats, null, 2));
    console.log('Initial Aptitude History:', analyticsData1.analytics.aptitudeHistory);

    if (analyticsData1.analytics.stats.wins !== 0) throw new Error('Initial wins should be 0');

    console.log('\n--- Phase 4: Save Aptitude Result ---');
    const saveRes = await fetch(`${BASE_URL}/practice/aptitude/result`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            categoryId: 'quantitative',
            categoryTitle: 'Quantitative Aptitude',
            score: 5,
            total: 5,
            percentage: 100
        })
    });
    const saveData = await saveRes.json();
    console.log('Save Result:', saveData);

    console.log('\n--- Phase 5: Check Analytics (After Save) ---');
    const analyticsRes2 = await fetch(`${BASE_URL}/users/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const analyticsData2 = await analyticsRes2.json();
    console.log('Final Aptitude History:', JSON.stringify(analyticsData2.analytics.aptitudeHistory, null, 2));

    if (analyticsData2.analytics.aptitudeHistory.length === 0) throw new Error('Aptitude history should not be empty');

    console.log('\n✅ VERIFICATION SUCCESSFUL: Real data persistence confirmed.');
}

verify().catch(err => {
    console.error('\n❌ VERIFICATION FAILED:', err.message);
    process.exit(1);
});
