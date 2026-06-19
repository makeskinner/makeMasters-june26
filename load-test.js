const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
// Pull the API Key from DigitalOcean's environment variables
const makeApiKey = process.env.MAKE_API_KEY; 
const concurrentRequests = 350;

async function blastWebhook() {
    if (!makeWebhookUrl || !makeApiKey) {
        console.error("Error: Missing MAKE_WEBHOOK_URL or MAKE_API_KEY environment variable.");
        process.exit(1);
    }

    console.log(`Starting load test with ${concurrentRequests} concurrent requests...`);
    
    const requests = Array.from({ length: concurrentRequests }).map((_, index) => {
        return fetch(makeWebhookUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Pass the authentication key in the header Make expects
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
    
    setTimeout(() => process.exit(0), 5000); 
}

blastWebhook();