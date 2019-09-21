import { Plugin } from './types'

export const plugins: Plugin[] = []

export function use(plugin: Plugin): void {
  if (plugins.indexOf(plugin) === -1) {
    plugins.push(plugin)
  }
}
