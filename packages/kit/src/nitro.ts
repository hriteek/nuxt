import { type Nitro, type NitroDevEventHandler, type NitroEventHandler } from 'nitropack'
import { type Import } from 'unimport'
import { normalize } from 'pathe'
import { useNuxt } from './context'
import { toArray } from './utils'

/**
 * Normalizes handler object
 *
 */
function normalizeHandlerMethod(handler: NitroEventHandler) {
  // retrieve method from handler file name
  const [, method] = handler.handler.match(
    /\.(get|head|patch|post|put|delete|connect|options|trace)(\.\w+)*$/
  ) || []

  return {
    method,
    ...handler,
    handler: normalize(handler.handler)
  }
}

/**
 * Adds a Nitro server handler
 *
 */
export function addServerHandler(handler: NitroEventHandler) {
  useNuxt().options.serverHandlers.push(normalizeHandlerMethod(handler))
}

/**
 * Adds a Nitro server handler for development only
 *
 */
export function addDevServerHandler(handler: NitroDevEventHandler) {
  useNuxt().options.devServerHandlers.push(handler)
}

/**
 * Adds a Nitro plugin
 */
export function addServerPlugin(plugin: string) {
  const nuxt = useNuxt()

  nuxt.options.nitro.plugins = nuxt.options.nitro.plugins || []

  nuxt.options.nitro.plugins.push(normalize(plugin))
}

/**
 * Adds routes to be prerendered
 */
export function addPrerenderRoutes(routes: string | string[]) {
  const nuxt = useNuxt()

  if (!Array.isArray(routes)) {
    routes = [routes]
  }

  routes = routes.filter(Boolean)

  if (routes.length === 0) {
    return
  }

  nuxt.hook('prerender:routes', (context) => {
    for (const route of routes) {
      context.routes.add(route)
    }
  })
}

/**
 * Access to the Nitro instance
 *
 * **Note:** You can call `useNitro()` only after `ready` hook.
 *
 * **Note:** Changes to the Nitro instance configuration are not applied.
 * @example
 *
 * ```ts
 * nuxt.hook('ready', () => {
 *   console.log(useNitro())
 * })
 * ```
 */
export function useNitro(): Nitro {
  const nuxt = useNuxt()

  // eslint-disable-next-line style/max-len
  // eslint-disable-next-line ts/no-unsafe-assignment, ts/no-unsafe-member-access, ts/no-explicit-any
  const nitro = (nuxt as any)._nitro

  if (!nitro) {
    throw new Error('Nitro is not initialized yet. You can call `useNitro()` only after `ready` hook.')
  }

  // eslint-disable-next-line ts/no-unsafe-return
  return nitro
}

/**
 * Add server imports to be auto-imported by Nitro
 */
export function addServerImports(imports: Import[]) {
  const nuxt = useNuxt()

  nuxt.hook('nitro:config', (config) => {
    config.imports ||= {}

    config.imports.imports ||= []

    config.imports.imports.push(...imports)
  })
}

/**
 * Add directories to be scanned for auto-imports by Nitro
 */
export function addServerImportsDir(
  directories: string | string[],
  options: { prepend?: boolean } = {}
) {
  const nuxt = useNuxt()

  nuxt.hook('nitro:config', (config) => {
    config.imports ||= {}

    config.imports.dirs ||= []

    config.imports.dirs[options.prepend ? 'unshift' : 'push'](...toArray(directories))
  })
}
