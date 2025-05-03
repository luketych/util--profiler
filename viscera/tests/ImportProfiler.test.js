import ImportProfiler from '../src/ImportProfiler.js';

// Use top-level await to get the original module first
const { default: originalDebug } = await import('debug');

// Mock the debug module
const mockDebugLog = jest.fn();
jest.mock('debug', () => { // Synchronous factory
  // Return a function that returns our mock logger for the specific namespace
  return {
    __esModule: true, // Mark as module
    default: jest.fn((namespace) => {
      if (namespace === 'app:profiler:imports') {
        return mockDebugLog;
      }
      // Return the original debug for other namespaces if needed
      return originalDebug(namespace);
    })
  };
});

describe('ImportProfiler', () => {
  const MOCK_CALLER_FILE = '/path/to/caller.js';
  const MOCK_RELATIVE_PATH = 'src/caller.js';
  let profiler;

  beforeEach(() => {
    // Reset the mock before each test
    mockDebugLog.mockClear();
    // Create a new profiler instance
    profiler = new ImportProfiler(MOCK_CALLER_FILE, MOCK_RELATIVE_PATH);
  });

  test('constructor initializes properties correctly', () => {
    expect(profiler.callerFile).toBe(MOCK_CALLER_FILE);
    expect(profiler.relativePathFromCallerPackage).toBe(MOCK_RELATIVE_PATH);
    expect(profiler.imports).toBeInstanceOf(Map);
    expect(profiler.imports.size).toBe(0);
    expect(profiler.startTime).toBeDefined();
    expect(profiler.lastImport).toBeNull();
    expect(profiler.lastTotalTime).toBe(0);
  });

  test('trackImport updates lastImport correctly', () => {
    const moduleName = './myModule.js';
    const importTime = 123.45;

    profiler.trackImport(moduleName, importTime);

    expect(profiler.imports.size).toBe(1);
    expect(profiler.imports.get(moduleName)).toBe(importTime);
    expect(profiler.lastImport).toEqual({ moduleName, importTime });
  });

  test('summarize logs the last import time using debug (below 1s)', () => {
    const moduleName = './anotherModule.js';
    const importTime = 50.678;

    profiler.trackImport(moduleName, importTime);
    profiler.summarize();

    expect(mockDebugLog).toHaveBeenCalledTimes(1);
    expect(mockDebugLog).toHaveBeenCalledWith(`[${moduleName}] (importTime: ${importTime.toFixed(2)}ms)`);
  });

  test('summarize logs the last import time using debug (above 1s, colored)', () => {
    const moduleName = './slowModule.js';
    const importTime = 1500.123;

    profiler.trackImport(moduleName, importTime);
    profiler.summarize();

    // Expected string with ANSI color codes for red text
    const expectedLogString = `[${moduleName}] (importTime: \x1b[31m${importTime.toFixed(2)}\x1b[0mms)`;

    expect(mockDebugLog).toHaveBeenCalledTimes(1);
    expect(mockDebugLog).toHaveBeenCalledWith(expectedLogString);
  });

   test('summarize does not log if no import was tracked', () => {
    profiler.summarize();
    expect(mockDebugLog).not.toHaveBeenCalled();
  });
});
