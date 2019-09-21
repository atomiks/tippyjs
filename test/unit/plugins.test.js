import { plugins, use } from '../../src/plugins'

describe('use', () => {
  const func = () => {}

  it('pushes the plugin into plugins', () => {
    use(func)
    expect(plugins[0]).toBe(func)
  })

  it('does not allow duplicate plugins', () => {
    use(func)
    expect(plugins.length).toBe(1)
  })
})
