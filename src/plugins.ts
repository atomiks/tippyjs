import { Plugin } from './types'
import { defaultProps } from './props'
import { warnWhen } from './validation'

export const plugins: Plugin[] = []

export function use(plugin: Plugin): void {
  if (__DEV__) {
    warnWhen(
      plugins.some(p => p.name === plugin.name),
      `A plugin with name \`${plugin.name}\` has already been registered.`,
    )

    warnWhen(
      typeof plugin.fn !== 'function',
      `The passed plugin must have a \`fn\` property of type "function".`,
    )
  }

  if (plugins.indexOf(plugin) === -1) {
    plugins.push(plugin)

    // If the plugin provides a prop, register it in the defaultProps object
    if (plugin.name) {
      defaultProps[plugin.name] = plugin.defaultValue
    }
  }
}
