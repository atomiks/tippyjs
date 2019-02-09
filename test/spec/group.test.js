import tippy from '../../src/js'
import group from '../../src/js/group'
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
})
