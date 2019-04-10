import tippy from '../../src/index'
import group from '../../src/group'
import { h, cleanDocumentBody } from '../utils'

jest.useFakeTimers()

afterEach(cleanDocumentBody)

describe('group', () => {
  it('does not override lifecycle functions', () => {
    const delay = 50
    const refs = [h()]
    const options = {
      duration: 0,
      onHide: jest.fn(),
      onShow: jest.fn(),
      onShown: jest.fn(),
    }
    const instances = tippy(refs, options, { delay })
    group(tippy(refs, options), { delay })
    instances[0].show()
    jest.runAllTimers()
    expect(options.onShow).toHaveBeenCalledTimes(1)
    expect(options.onShown).toHaveBeenCalledTimes(1)
    instances[0].hide()
    jest.runAllTimers()
    expect(options.onHide).toHaveBeenCalledTimes(1)
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
