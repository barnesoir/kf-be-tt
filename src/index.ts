import { ApiWrapper, attachDeviceNames, filterOutages, Outage, SiteInfo } from "./api-wrapper";

// Constants
const SITE_ID = 'norwich-pear-tree';
const API_KEY = process.argv[2];

// Main
(async () => {
    // Ensure API key is passed as argument
    if (!API_KEY) {
        console.error('Please pass your API key as an argument to this script.');
        process.exit(1);
    }

    const wrapper = new ApiWrapper(API_KEY);

    // Get all outages
    const outages = await wrapper.getOutages();

    // Get site info for the site with the ID SITE_ID
    const siteInfo = await wrapper.getSiteInfo(SITE_ID);

    // Filter out any outages that began before 2022-01-01T00:00:00.000Z or don't have an ID that is in the list of devices in the site information
    const filteredOutages = filterOutages(outages, siteInfo, new Date('2022-01-01T00:00:00.000Z'));
    // For the remaining outages, attach the display name of the device in the site information to each appropriate outage
    attachDeviceNames(filteredOutages, siteInfo);

    // Send the list of outages to POST /site-outages/{siteId} for the site with the ID SITE_ID
    const response = await wrapper.postSiteOutages(SITE_ID, filteredOutages);
    console.log(response)
})();