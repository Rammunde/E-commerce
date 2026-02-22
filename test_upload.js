const http = require('http');

const data = JSON.stringify({
    usersData: [
        { firstName: "Rahul", lastName: "Kale", mobile: "9082882232" },
        { firstName: "Sachin", lastName: "Munde", mobile: "9172123412" }
    ]
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/users/bulkUploadUsers',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Response:', JSON.parse(body));
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
    process.exit(1);
});

req.write(data);
req.end();
