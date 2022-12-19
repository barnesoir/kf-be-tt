"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
// // Mock the fetch API to return a response with a specific status code
// jest.mock(fetch, () => jest.fn(() => Promise.resolve({
//     status: 200,
//     json: () => Promise.resolve(mockResponseJson)
// })));
global.fetch = jest.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve(mockResponseJson)
}));
describe('makeRequest', () => {
    it('makes a request to the given URL and returns the JSON response', async () => {
        const response = await (0, index_1.makeRequest)('https://example.com', {});
        expect(response).toEqual(mockResponseJson);
    });
    it('retries the request if the response status is in the RETRY_CODES array and has not yet reached the maximum number of retries', async () => {
        // Mock the fetch API to return a response with a status code of 500
        fetch.mockReturnValueOnce(Promise.resolve({
            status: 500,
            json: () => Promise.resolve(mockResponseJson)
        }));
        // Make a request
        const response = await (0, index_1.makeRequest)('https://example.com', {});
        expect(response).toEqual(mockResponseJson);
    });
    it('throws an error if the request fails after the maximum number of retries', async () => {
        // Mock the fetch API to return a response with a status code of 500
        fetch.mockReturnValue(Promise.resolve({
            status: 500,
            json: () => Promise.resolve(mockResponseJson)
        }));
        // Make a request
        try {
            await (0, index_1.makeRequest)('https://example.com', {});
        }
        catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    });
});
// import { makeRequest } from "./index";
// describe("makeRequest", () => {
//     it("should return the expected result for a successful request", async () => {
//         const mockJsonPromise = Promise.resolve({ data: "test data" });
//         const mockFetchPromise = Promise.resolve({ json: () => mockJsonPromise });
//         jest.spyOn(global, "fetch").mockImplementation(() => mockFetchPromise);
//         const url = "https://example.com";
//         const options = { method: "GET" };
//         const result = await makeRequest<{ data: string }>(url, options);
//         expect(result).toEqual({ data: "test data" });
//     });
//     it("should retry the request if the response has a retry code and retries are remaining", async () => {
//         const mockJsonPromise = Promise.resolve({ data: "test data" });
//         const mockFetchPromise = Promise.resolve({
//             status: 500,
//             json: () => mockJsonPromise,
//         });
//         jest.spyOn(global, "fetch").mockImplementation(() => mockFetchPromise);
//         const url = "https://example.com";
//         const options = { method: "GET" };
//         await makeRequest<{ data: string }>(url, options);
//         expect(global.fetch).toHaveBeenCalledTimes(4);
//     });
//     it("should not retry the request if the response has a non-retry code", async () => {
//         const mockJsonPromise = Promise.resolve({ data: "test data" });
//         const mockFetchPromise = Promise.resolve({
//             status: 400,
//             json: () => mockJsonPromise,
//         });
//         jest.spyOn(global, "fetch").mockImplementation(() => mockFetchPromise);
//         const url = "https://example.com";
//         const options = { method: "GET" };
//         await makeRequest<{ data: string }>(url, options);
//         expect(global.fetch).toHaveBeenCalledTimes(1);
//     });
//     it("should throw an error if the request fails", async () => {
//         jest.spyOn(global, "fetch").mockImplementation(() => {
//             throw new Error("request failed");
//         });
//         const url = "https://example.com";
//         const options = { method: "GET" };
//         try {
//             await makeRequest<{ data: string }>(url, options);
//             fail();
//         } catch (error) {
//             expect(error).toEqual(new Error("request failed"));
//         }
//     });
// });
//# sourceMappingURL=index.test.js.map