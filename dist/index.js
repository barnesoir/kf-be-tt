"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRequest = void 0;
// Constants
const SITE_ID = 'norwich-pear-tree';
const BASE_URL = 'https://api.krakenflex.systems/interview-tests-mock-api/v1';
const MAX_RETRIES = 3;
const RETRY_CODES = [500];
const API_KEY = process.argv[2];
async function makeRequest(url, options) {
    let retries = 0;
    while (true) {
        try {
            const response = await fetch(url, options);
            console.log({ response });
            if (RETRY_CODES.includes(response.status) && retries < MAX_RETRIES) {
                retries++;
                // console.log(`Encountered a ${response.status} error. Retrying (attempt ${retries})...`);
                continue;
            }
            // console.log(`Method: ${options.method || 'GET'} | URL: ${url} | Status: ${response.status} | Retries: ${retries}`)
            return await response.json();
        }
        catch (error) {
            throw error;
        }
    }
}
exports.makeRequest = makeRequest;
// Helper function to make a GET request to the /outages endpoint
async function getOutages() {
    return await makeRequest(`${BASE_URL}/outages`, { headers: { 'x-api-key': API_KEY } });
}
// Helper function to make a GET request to the /site-info/{siteId} endpoint
async function getSiteInfo(siteId) {
    return await makeRequest(`${BASE_URL}/site-info/${siteId}`, { headers: { 'x-api-key': API_KEY } });
}
// Helper function to make a POST request to the /site-outages/{siteId} endpoint
async function postSiteOutages(siteId, outages) {
    return await makeRequest(`${BASE_URL}/site-outages/${siteId}`, {
        headers: { 'x-api-key': API_KEY },
        method: 'POST',
        body: JSON.stringify(outages)
    });
}
// Main function
(async () => {
    // Ensure API key is passed as argument && not running in test mode
    if (!API_KEY && !process.env.JEST_WORKER_ID) {
        console.error('Please pass your API key as an argument to this script.');
        process.exit(1);
    }
    // Get all outages
    const outages = await getOutages();
    // Get site info for the site with the ID SITE_ID
    const siteInfo = await getSiteInfo(SITE_ID);
    // Filter out any outages that began before 2022-01-01T00:00:00.000Z or don't have an ID that is in the list of devices in the site information
    const filteredOutages = outages.filter(outage => {
        return new Date(outage.begin) >= new Date('2022-01-01T00:00:00.000Z') && siteInfo.devices.some(device => device.id === outage.id);
    });
    // For the remaining outages, attach the display name of the device in the site information to each appropriate outage
    filteredOutages.forEach(outage => {
        const device = siteInfo.devices.find(device => device.id === outage.id);
        if (device) {
            outage.name = device.name;
        }
    });
    // Send the list of outages to POST /site-outages/{siteId} for the site with the ID SITE_ID
    const response = await postSiteOutages(SITE_ID, filteredOutages);
    console.log(response);
})();
//# sourceMappingURL=index.js.map