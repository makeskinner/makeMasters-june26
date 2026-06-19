const http = require('http');

const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
const makeApiKey = process.env.MAKE_API_KEY; 
const concurrentRequests = 350;

// The load-testing function
async function blastWebhook() {
    console.log(`[ALERT] Webinar Triggered! Blasting ${concurrentRequests} concurrent requests...`);
    
    const requests = Array.from({ length: concurrentRequests }).map((_, index) => {
        return fetch(makeWebhookUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-make-apikey': makeApiKey 
            },
            body: JSON.stringify({ eventId: index, timestamp: new Date() })
        }).then(res => {
            console.log(`Request ${index}: Status ${res.status}`);
        }).catch(err => {
            console.error(`Request ${index} failed:`, err.message);
        });
    });

    await Promise.all(requests);
    console.log("Load test complete.");
}

// Create an HTTP server that listens for Make's ping
const server = http.createServer(async (req, res) => {
    // Check if the request is a POST or GET to our trigger endpoint
    if (req.url === '/trigger-blast') {
        // Fire off the load test asynchronously so the webhook response doesn't timeout
        blastWebhook();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Load test initiated successfully!" }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Not Found" }));
    }
});

// DigitalOcean App Platform automatically passes a PORT environment variable
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is live and listening on port ${PORT}`);
});