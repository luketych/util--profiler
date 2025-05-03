import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

import getPackageName from './getPackageName.js'
import getWorkspaceURIs from './getWorkspaceURIs.js'
import ImportProfiler from './ImportProfiler.js'

/**
 * Profiles the import of a module and tracks the time it takes to load.
 * 
 * @param {string} modulePath - The path to the module to import.
 * @param {string} importMetaUrl - The import.meta.url of the calling module.
 * @param {function} [_importer=import] - Optional function to use for dynamic imports (for testing).
 * @returns {Promise<any>} - A promise resolving to the imported module.
 */
export default async function profileImport(modulePath, importMetaUrl, _importer = null) {
    if (!importMetaUrl) {
        throw new Error('importMetaUrl is required for relative module paths')
    }

    const packageName = await getPackageName({ dirname: importMetaUrl })

    const callerFile = importMetaUrl
    const relativePathFromCallerPackage = callerFile;

    const importer = _importer || ((path) => import(path)); // Default to native import
    const isRelative = modulePath.startsWith('.');
    const isWorkspace = modulePath.startsWith('@ktr-srt/');

    const start = process.hrtime.bigint()
    
    let resolvedPath = modulePath; // Default for non-relative, non-workspace

    if (isRelative) {
        // Resolve relative path using import.meta.url
        resolvedPath = fileURLToPath(new URL(modulePath, importMetaUrl));
    } else if (isWorkspace) {
        // Resolve workspace path
        try {
            const callerDir = dirname(fileURLToPath(importMetaUrl));
            const workspaceURIs = await getWorkspaceURIs(callerDir); // Pass caller directory
            const prefix = modulePath.substring(0, modulePath.indexOf('/') + 1);
            const pkgName = modulePath.substring(prefix.length);
            const workspaceURI = workspaceURIs.find(uri => modulePath.includes(uri.split('/').pop()))

            if (!workspaceURI) {
                throw new Error(`Could not find workspaceURI for ${modulePath}`)
            }

            resolvedPath = workspaceURI
        } catch (error) {
            throw new Error(`Could not find workspaceURI for ${modulePath}`)
        }
    }
    
    // Use the injected or default importer
    const module = await importer(resolvedPath);
    const time = Number(process.hrtime.bigint() - start) / 1e6

    const importProfiler = new ImportProfiler(callerFile, relativePathFromCallerPackage)

    importProfiler.trackImport(modulePath, time)
  
    importProfiler.summarize()
  
    
    // If module only contains a default export, return it directly
    if (module.default && Object.keys(module).length === 1) {
        return module.default
    }

    return module
}
