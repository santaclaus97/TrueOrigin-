const http = require('http');

http.get('http://localhost:5173', (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
        data += chunk;
    });
    resp.on('end', () => {
        console.log("Response:", data.substring(0, 100));
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
