import profileImport from '../src/profileImport.js';
import ImportProfiler from '../src/ImportProfiler.js';

// --- Mocks ---

// Mock utility functions
const mockGetPackageName = jest.fn();
const mockGetWorkspaceURIs = jest.fn();
jest.mock('../src/getPackageName.js', () => ({
  __esModule: true,
  default: mockGetPackageName,
}));
jest.mock('../src/getWorkspaceURIs.js', () => ({
  __esModule: true,
  default: mockGetWorkspaceURIs,
}));

// Mock ImportProfiler class
const mockTrackImport = jest.fn();
const mockSummarize = jest.fn();
jest.mock('../src/ImportProfiler.js', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        trackImport: mockTrackImport,
        summarize: mockSummarize,
      };
    })
  }
});

// Mock dynamic import()
// Store mocked modules here
const mockModules = {}; 
// Need to use jest.unstable_mockModule for ESM dynamic imports
jest.unstable_mockModule('*/module.js', () => ({ default: { data: 'mock data' } }), { virtual: true });
jest.unstable_mockModule('*/another.js', () => ({ value: 123 }), { virtual: true });
jest.unstable_mockModule('/path/to/workspace/pkg/index.js', () => ({ id: 'workspace-pkg' }), { virtual: true });

// --- Tests ---

describe('profileImport', () => {
  const MOCK_IMPORT_META_URL = 'file:///path/to/caller/file.js';
  const MOCK_PACKAGE_NAME = 'test-package';

  beforeEach(() => {
    // Reset mocks before each test
    mockGetPackageName.mockClear().mockResolvedValue(MOCK_PACKAGE_NAME);
    mockGetWorkspaceURIs.mockClear().mockResolvedValue(['/path/to/workspace/pkg']);
    mockTrackImport.mockClear();
    mockSummarize.mockClear();
    jest.clearAllMocks();
    // Clear ImportProfiler mock instance creation count using the imported mock
    ImportProfiler.mockClear(); 
  });

  test('should throw error if import.meta.url is missing', async () => {
    await expect(profileImport('./module.js', undefined)).rejects.toThrow(
      'importMetaUrl is required for relative module paths'
    );
  });

  test('should import a relative module path correctly', async () => {
    const modulePath = './module.js';
    const expectedResolvedPath = '/path/to/caller/module.js'; // Based on MOCK_IMPORT_META_URL

    const result = await profileImport(modulePath, MOCK_IMPORT_META_URL);

    // Check mocks
    expect(mockGetPackageName).toHaveBeenCalledWith({ dirname: MOCK_IMPORT_META_URL });
    expect(ImportProfiler).toHaveBeenCalledTimes(1);
    expect(mockTrackImport).toHaveBeenCalledTimes(1);
    expect(mockSummarize).toHaveBeenCalledTimes(1);

    // Check the name passed to trackImport
    expect(mockTrackImport).toHaveBeenCalledWith(modulePath, expect.any(Number));

    // Check result
    expect(result).toEqual({ data: 'mock data' }); // Default export is returned
  });

  test('should import a non-relative module path correctly', async () => {
    const modulePath = 'another.js'; // Not starting with '.'
    
    const result = await profileImport(modulePath, MOCK_IMPORT_META_URL);

    expect(mockGetPackageName).toHaveBeenCalledWith({ dirname: MOCK_IMPORT_META_URL });
    expect(ImportProfiler).toHaveBeenCalledTimes(1);
    expect(mockTrackImport).toHaveBeenCalledWith(modulePath, expect.any(Number));
    expect(mockSummarize).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ value: 123 }); // Named export returned
  });

  test('should handle @ktr-srt/ workspace paths', async () => {
    const modulePath = '@ktr-srt/pkg';
    const expectedWorkspacePath = '/path/to/workspace/pkg/index.js'; // Needs resolution logic in test or mock

    const result = await profileImport(modulePath, MOCK_IMPORT_META_URL);

    expect(mockGetPackageName).toHaveBeenCalledWith({ dirname: MOCK_IMPORT_META_URL });
    expect(mockGetWorkspaceURIs).toHaveBeenCalledWith(MOCK_PACKAGE_NAME);
    expect(ImportProfiler).toHaveBeenCalledTimes(1);
    // Note: The dynamic import mock needs to map the final resolved path
    expect(mockTrackImport).toHaveBeenCalledWith(modulePath, expect.any(Number)); 
    expect(mockSummarize).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'workspace-pkg' });
  });

    test('should throw error if workspace URI is not found for @ktr-srt/', async () => {
        const modulePath = '@ktr-srt/not-found-pkg';
        mockGetWorkspaceURIs.mockResolvedValue([]); // Mock empty workspaces

        await expect(profileImport(modulePath, MOCK_IMPORT_META_URL)).rejects.toThrow(
            `Could not find workspaceURI for ${modulePath}`
        );
        expect(mockGetWorkspaceURIs).toHaveBeenCalledWith(MOCK_PACKAGE_NAME);
    });
});
