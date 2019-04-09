import tippy from '../../src/index'
import group from '../../src/group'
import { h, wait } from '../utils'

describe('group', () => {
  it('does not override lifecycle functions', async () => {
    const options = {
      duration: 0,
      onHide: jest.fn(),
      onShow: jest.fn(),
      onShown: jest.fn(),
    }
    const refs = [h()]
    group(tippy(refs, options), { delay: 50 })
    refs[0]._tippy.show()
    expect(options.onShow).toHaveBeenCalled()
    await wait(50)
    expect(options.onShown).toHaveBeenCalled()
    refs[0]._tippy.hide()
    expect(options.onHide).toHaveBeenCalled()
  })

  it('is updateable after calling multiple times', () => {
    const refs = [h()]
    const instances = tippy(refs)
    group(instances, { delay: 100 })
    group(instances, { delay: 400 })
    instances[0].show()
    expect(instances[0].props.delay).toEqual([0, 400])
  })
})
