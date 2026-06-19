// Reads the URL securely from DigitalOcean App environment variables
const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
const concurrentRequests = 350;

async function blastWebhook() {
    if (!makeWebhookUrl) {
        console.error("Error: MAKE_WEBHOOK_URL environment variable is not defined.");
        process.exit(1);
    }

    console.log(`Starting load test with ${concurrentRequests} concurrent requests to ${makeWebhookUrl}...`);
    
    const requests = Array.from({ length: concurrentRequests }).map((_, index) => {
        return fetch(makeWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: index, timestamp: new Date() })
        }).then(res => {
            console.log(`Request ${index}: Status ${res.status}`);
        }).catch(err => {
            console.error(`Request ${index} failed:`, err.message);
        });
    });

    await Promise.all(requests);
    console.log("Load test complete.");
    
    // Keeps the container alive for a short moment so you can read the full logs
    setTimeout(() => process.exit(0), 5000); 
}

blastWebhook();