import { plugins, use } from '../../src/plugins'
import { getFormattedMessage } from '../../src/validation'
import { defaultProps } from '../../src/props'

describe('use', () => {
  const plugin = { fn() {} }

  it('pushes the plugin into plugins', () => {
    use(plugin)
    expect(plugins[0]).toBe(plugin)
  })

  it('does not allow duplicate plugins', () => {
    use(plugin)
    expect(plugins.length).toBe(1)
  })

  it('warns if duplicate plugin names', () => {
    const spy = jest.spyOn(console, 'warn')

    use({ plugin: 'name', fn() {} })
    use({ plugin: 'name', fn() {} })

    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `A plugin with name \`${plugin.name}\` has already been registered.`,
      ),
    )

    spy.mockRestore()
  })

  it('warns if `plugin.fn` is not a function', () => {
    const spy = jest.spyOn(console, 'warn')

    use({ fn: null })

    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `The passed plugin must have a \`fn\` property of type "function".`,
      ),
    )

    spy.mockRestore()
  })

  it('adds the plugin to defaultProps object', () => {
    use({ name: 'hello', defaultValue: 1000, fn() {} })

    expect(defaultProps.hello).toBe(1000)
  })
})
