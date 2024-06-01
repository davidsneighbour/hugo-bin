
import { jest } from '@jest/globals'
import https from 'https';
import { fetchReleases } from './fetch.mjs';

//https://blog.logrocket.com/testing-typescript-apps-using-jest/
//https://jestjs.io/docs/getting-started
// testing mit typescript

// Manually mock https.get within each test
describe('fetchReleases', () => {
    let originalGet;

    beforeEach(() => {
        // save the original https.get function
        originalGet = https.get;

        // replace https.get with a Jest mock function
        // @ts-ignore
        https.get = jest.fn();
    });

    afterEach(() => {
        // restore the original https.get function after each test
        https.get = originalGet;
    });

    test('successfully fetches data', async () => {
        // Define mock implementation for this test
        const mockData = JSON.stringify([{ id: 1, name: "Release 1" }]);
        // @ts-ignore
        https.get.mockImplementation((url, options, callback) => {
            const res = {
                on: (event, handler) => {
                    if (event === 'data') handler(mockData);
                    if (event === 'end') handler();
                }
            };
            callback(res);
            return { on: jest.fn() };
        });

        const url = 'https://api.example.com/releases';
        const data = await fetchReleases(url);
        expect(data).toEqual(JSON.parse(mockData));
    });

    test('handles network errors', async () => {
        // Simulate a network error
        // @ts-ignore
        https.get.mockImplementation((url, options, callback) => {
            return {
                on: (event, handler) => {
                    if (event === 'error') handler(new Error('Network error'));
                }
            };
        });

        const url = 'https://api.example.com/releases';
        await expect(fetchReleases(url)).rejects.toThrow('Network error');
    });

    test('handles invalid JSON response', async () => {
        // Simulate an invalid JSON response
        // @ts-ignore
        https.get.mockImplementation((url, options, callback) => {
            const res = {
                on: (event, handler) => {
                    if (event === 'data') handler('Invalid JSON');
                    if (event === 'end') handler();
                }
            };
            callback(res);
            return { on: jest.fn() };
        });

        const url = 'https://api.example.com/releases';
        await expect(fetchReleases(url)).rejects.toThrow(SyntaxError);
    });

});
