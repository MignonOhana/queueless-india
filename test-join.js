const url = 'http://localhost:3000/api/queue/join';
const body = {
    orgId: 'tirupati-ttd-tirupati', // Sample business ID from DB
    customerName: 'Test QA',
    customerPhone: '+919876543210',
    counterPrefix: 'Q'
};

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
})
.then(async res => {
    console.log("Status:", res.status);
    console.log("Response:", await res.text());
})
.catch(console.error);
