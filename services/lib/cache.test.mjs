import { cacheFileExists, readCache, writeCache, createCacheFilePath } from './cache.mjs';
import fs from 'fs/promises';
import mockFs from 'mock-fs';
import path from 'path';

// jest.mock('fs/promises', () => ({
//     ...jest.requireActual('fs/promises'),
//     readFilePermissionDenied: jest.fn().mockRejectedValue(new Error('EACCES: permission denied')),
//     writeFilePermissionDenied: jest.fn().mockRejectedValue(new Error('EACCES: permission denied')),
//     writeFileMissing: jest.fn().mockRejectedValue(new Error('ENOENT: no such file or directory')),
// }));

describe('cacheFileExists', () => {
    beforeEach(() => {
        // Setup a mock file system before each test
        mockFs({
            'path/to': {
                'existingFile.json': JSON.stringify({ data: 'This is a test' }),
            },
        });
    });

    afterEach(() => {
        //jest.restoreAllMocks(); // Restore original implementations
        mockFs.restore();       // Restore the file system
    });

    test('returns true if the file exists', async () => {
        expect(await cacheFileExists('path/to/existingFile.json')).toBeTruthy();
    });

    test('returns false if the file does not exist', async () => {
        expect(await cacheFileExists('path/to/nonExistingFile.json')).toBeFalsy();
    });
});

describe('readCache', () => {
    beforeEach(() => {
        mockFs({
            'path/to': {
                'cache.json': JSON.stringify({ key: 'value' }),
                'empty.json': '',
                'wrongFormat.json': 'not json content',
                'invalid.json': '{invalid}',
            },
        });
    });

    afterEach(() => {
        //jest.restoreAllMocks(); // Restore original implementations
        mockFs.restore();       // Restore the file system
    });

    test('reads and parses JSON from an existing file', async () => {
        const data = await readCache('path/to/cache.json');
        expect(data).toEqual({ key: 'value' });
    });

    test('returns an empty array if the file does not exist', async () => {
        const data = await readCache('path/to/nonExistingFile.json');
        expect(data).toEqual([]);
    });

    test('returns an empty array if the file exists but is empty', async () => {
        const data = await readCache('path/to/empty.json');
        expect(data).toEqual([]);
    });

    test('returns an empty array if the file contains invalid JSON', async () => {
        const data = await readCache('path/to/invalid.json');
        expect(data).toEqual([]);
    });

    test('throws an error if the file exists but contains non-JSON', async () => {
        const data = await readCache('path/to/wrongFormat.json');
        expect(data).toEqual([]);
    });
});

describe('writeCache', () => {
    beforeEach(() => {
        mockFs({
            'path/to': {},
        });
    });

    afterEach(() => {
        //jest.restoreAllMocks(); // Restore original implementations
        mockFs.restore();       // Restore the file system
    });

    test('writes JSON data to a file', async () => {
        const filePath = 'path/to/cache.json';
        const data = { key: 'value' };
        await writeCache(filePath, data);

        const fileContent = await fs.readFile(filePath, 'utf8');
        expect(JSON.parse(fileContent)).toEqual(data);
    });
});

describe('createCacheFilePath', () => {
    test('creates cache file path using service name and default path', () => {
        const service = 'testService';
        const expectedPath = path.join('./resources/', 'testService.json');
        expect(createCacheFilePath(service)).toEqual(expectedPath);
    });

    test('creates cache file path using service name and custom path', () => {
        const service = 'testService';
        const customPath = './custom/path/';
        const expectedPath = path.join(customPath, 'testService.json');
        expect(createCacheFilePath(service, customPath)).toEqual(expectedPath);
    });

    test('throws an error if service name is not provided', () => {
        // @ts-ignore
        expect(() => createCacheFilePath()).toThrow('Service name is required');
    });
});
