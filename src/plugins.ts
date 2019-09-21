import { Plugin } from './types'
import { defaultProps } from './props'

export const plugins: Plugin[] = []

export function use(plugin: Plugin): void {
  if (plugins.indexOf(plugin) === -1) {
    plugins.push(plugin)

    // If the plugin provides a prop, register it in the defaultProps object
    if (plugin.name) {
      defaultProps[plugin.name] = plugin.defaultValue
    }
  }
}
