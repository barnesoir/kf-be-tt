import { makeRequest, ApiWrapper, Outage, filterOutages, SiteInfo, attachDeviceNames } from './api-wrapper';

//Generate random string as fake API Key
const API_KEY = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const api = new ApiWrapper(API_KEY);

const mockResponseJson = { foo: "bar" }
beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({
        status: 200,
        json: () => Promise.resolve(mockResponseJson)
    } as Response));
})

describe('filterOutages', () => {
    const fixedDate = new Date('2022-01-01T00:00:00.000Z');
    it('filters out outages that began before 2022-01-01T00:00:00.000Z', () => {
        const outages = [
            { id: '2', begin: '2021-12-31T23:59:59.999Z', end: '' },
            { id: '2', begin: '2022-01-01T00:00:00.000Z', end: '' },
            { id: '2', begin: '2022-01-01T00:00:00.001Z', end: '' },
        ];
        const siteInfo: SiteInfo = {
            id: '2',
            name: 'Site 2',
            devices: [
                { id: '2', name: 'Device 2' },
            ],
        };
        const result = filterOutages(outages, siteInfo, fixedDate);
        expect(result).toEqual([
            { id: '2', begin: '2022-01-01T00:00:00.000Z', end: '' },
            { id: '2', begin: '2022-01-01T00:00:00.001Z', end: '' },
        ]);
    });

    it('filters out outages that do not have an ID that is in the list of devices in the site information', () => {
        const outages = [
            { id: '1', begin: '2022-01-01T00:00:00.000Z', end: '' },
            { id: '2', begin: '2022-01-01T00:00:00.000Z', end: '' },
            { id: '3', begin: '2022-01-01T00:00:00.000Z', end: '' },
        ];
        const siteInfo = {
            id: '2',
            name: 'Site 2',
            devices: [
                { id: '2', name: 'Device 2' },
            ],
        };
        const result = filterOutages(outages, siteInfo, fixedDate);
        expect(result).toEqual([
            { id: '2', begin: '2022-01-01T00:00:00.000Z', end: '' },
        ]);
    });
    it('returns an empty array if no outages match the filter criteria', () => {
        const outages = [{ id: '1', begin: '2021-12-31T23:59:59.999Z', end: '' }, { id: '2', begin: '2021-12-31T23:59:59.999Z', end: '' },];
        const siteInfo = {
            id: '2',
            name: 'Site 2',
            devices: [
                { id: '3', name: 'Device 3' },
            ],
        };
        const result = filterOutages(outages, siteInfo, fixedDate);
        expect(result).toEqual([]);
    });
});

describe('attachDeviceNames', () => {
    it('attaches the display name of the device in the site information to each appropriate outage', () => {
        const outages: Outage[] = [
            { id: '1', begin: '2022-01-01T00:00:00.000Z', end: '' },
            { id: '2', begin: '2022-01-01T00:00:00.000Z', end: '' },
            { id: '3', begin: '2022-01-01T00:00:00.000Z', end: '' },
        ];
        const siteInfo: SiteInfo = {
            id: '2',
            name: 'Site 2',
            devices: [
                { id: '1', name: 'Device 1' },
                { id: '2', name: 'Device 2' },
            ],
        };
        attachDeviceNames(outages, siteInfo);
        expect(outages).toEqual([
            { id: '1', name: 'Device 1', begin: '2022-01-01T00:00:00.000Z', end: '' },
            { id: '2', name: 'Device 2', begin: '2022-01-01T00:00:00.000Z', end: '' },
            { id: '3', begin: '2022-01-01T00:00:00.000Z', end: '' },
        ]);
    });
});


describe('makeRequest', () => {
    it('makes a request to the given URL and returns the JSON response', async () => {
        const response = await makeRequest<{ foo: string }>('https://example.com', {});
        expect(response).toEqual(mockResponseJson);
    });

    it('retries the request if the response status is in the RETRY_CODES array and has not yet reached the maximum number of retries', async () => {
        // Mock the fetch API to return a response with a status code of 500 only once
        (fetch as jest.Mock).mockReturnValueOnce(Promise.resolve({
            status: 500,
            json: () => Promise.resolve(mockResponseJson)
        }));

        // Make a request
        const response = await makeRequest<{ foo: string }>('https://example.com', {});
        expect(response).toEqual(mockResponseJson);
    });

    it('throws an error if the request fails after the maximum number of retries', async () => {
        // Mock the fetch API to return a response with a status code of 500 all the time
        (fetch as jest.Mock).mockReturnValue(Promise.resolve({
            status: 500,
            json: () => Promise.resolve(mockResponseJson)
        }));

        // Make a request
        try {
            await makeRequest<{ foo: string }>('https://example.com', {});
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    });
});

describe('getOutages', () => {
    test('should make a GET request to the /outages endpoint', async () => {
        const result = await api.getOutages();
        expect(result).toEqual({ foo: "bar" });
        expect(global.fetch).toHaveBeenCalledWith('https://api.krakenflex.systems/interview-tests-mock-api/v1/outages', { headers: { 'x-api-key': API_KEY } });
    });

    test('should throw an error if the request fails', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            throw new Error('Fetch error');
        });

        try {
            await api.getOutages();
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});

describe('getSiteInfo', () => {
    test('should make a GET request to the /site-info/{siteId} endpoint', async () => {
        const siteId = 'test-site';
        const result = await api.getSiteInfo(siteId);
        expect(result).toEqual(mockResponseJson);
        expect(global.fetch).toHaveBeenCalledWith(`https://api.krakenflex.systems/interview-tests-mock-api/v1/site-info/${siteId}`, { headers: { 'x-api-key': API_KEY } });
    });

    test('should throw an error if the request fails', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            throw new Error('Fetch error');
        });

        try {
            await api.getSiteInfo('test-site');
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});

describe('postSiteOutages', () => {
    test('should make a POST request to the /site-outages/{siteId} endpoint', async () => {
        const siteId = 'test-site';
        const outages: Outage[] = [{ id: 'outage1', begin: '2022-01-01T00:00:00.000Z', end: '' }, { id: 'outage2', begin: '2022-01-01T00:00:00.000Z', end: '' }];
        const result = await api.postSiteOutages(siteId, outages);
        expect(result).toEqual(mockResponseJson);
        expect(global.fetch).toHaveBeenCalledWith(`https://api.krakenflex.systems/interview-tests-mock-api/v1/site-outages/${siteId}`, {
            headers: { 'x-api-key': API_KEY },
            method: 'POST',
            body: JSON.stringify(outages)
        });
    });

    test('should throw an error if the request fails', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(() => {
            throw new Error('Fetch error');
        });

        try {
            await api.postSiteOutages('test-site', []);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});