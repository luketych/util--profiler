import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

import getPackageName from './getPackageName.js'
import getWorkspaceURIs from './getWorkspaceURIs.js'
import ImportProfiler from './ImportProfiler.js'

/**
 * Profiles the import of a module and tracks the time it takes to load.
 * 
 * @param {string} modulePath - The path to the module to import.
 * @param {string} importMetaUrl - The URL of the importing module.
 * @returns {Promise<*>} The imported module.
 */
export default async function profileImport(modulePath, importMetaUrl) {
    if (!importMetaUrl) {
        throw new Error('importMetaUrl is required for relative module paths')
    }

    const packageName = await getPackageName({ dirname: importMetaUrl })

    const callerFile = importMetaUrl
    const relativePathFromCallerPackage = join(packageName, importMetaUrl.split(packageName)[1])

    const start = process.hrtime.bigint()
    
    // Handle relative paths by resolving them against the caller's directory
    let resolvedPath = modulePath
    if (modulePath.startsWith('.')) {
        const callerDir = dirname(fileURLToPath(importMetaUrl))
        resolvedPath = resolve(callerDir, modulePath)
    }

    // if modulePath starts with '@ktr-srt/' then use the package name
    if (modulePath.startsWith('@ktr-srt/')) {
        const workspaceURIs = await getWorkspaceURIs(packageName)
        const workspaceURI = workspaceURIs.find(uri => modulePath.includes(uri.split('/').pop()))

        if (!workspaceURI) {
            throw new Error(`Could not find workspaceURI for ${modulePath}`)
        }

        resolvedPath = workspaceURI
    }
    
    const module = await import(resolvedPath)
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
