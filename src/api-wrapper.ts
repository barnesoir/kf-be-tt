const BASE_URL = 'https://api.krakenflex.systems/interview-tests-mock-api/v1';
const MAX_RETRIES = 3;
const RETRY_CODES = [500];

export function filterOutages(outages: Outage[], siteInfo: SiteInfo, startDate: Date): any[] {
    return outages.filter(outage => {
        return new Date(outage.begin) >= startDate && siteInfo.devices.some(device => device.id === outage.id);
    });
}

export function attachDeviceNames(outages: Outage[], siteInfo: SiteInfo) {
    outages.forEach(outage => {
        const device = siteInfo.devices.find(device => device.id === outage.id);
        if (device) {
            outage.name = device.name;
        }
    });
}

export async function makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    let retries = 0;
    while (true) {
        try {
            const response = await fetch(url, options);
            if (RETRY_CODES.includes(response.status) && retries < MAX_RETRIES) {
                retries++;
                console.log(`Encountered a ${response.status} error. Retrying (attempt ${retries})...`);
                continue;
            }
            console.log(`Method: ${options.method || 'GET'} | URL: ${url} | Status: ${response.status} | Retries: ${retries}`)
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
}

export class ApiWrapper {
    private _apiKey: string;

    constructor(apiKey: string) {
        this._apiKey = apiKey;
    }

    async getOutages(): Promise<Outage[]> {
        return await makeRequest<Outage[]>(`${BASE_URL}/outages`, { headers: { 'x-api-key': this._apiKey } });
    }

    async getSiteInfo(siteId: string): Promise<SiteInfo> {
        return await makeRequest<SiteInfo>(`${BASE_URL}/site-info/${siteId}`, { headers: { 'x-api-key': this._apiKey } });
    }

    async postSiteOutages(siteId: string, outages: Outage[]): Promise<object> {
        return await makeRequest<object>(`${BASE_URL}/site-outages/${siteId}`, {
            headers: { 'x-api-key': this._apiKey },
            method: 'POST',
            body: JSON.stringify(outages)
        });
    }
}

// Type definitions
export type Outage = {
    id: string;
    begin: string;
    end: string;
    name?: string;
};

type Device = {
    id: string;
    name: string;
};

export type SiteInfo = {
    id: string;
    name: string;
    devices: Device[];
};