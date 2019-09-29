import {
  h,
  cleanDocumentBody,
  MOUSEENTER,
  setTestDefaultProps,
} from '../../utils';

import {createTippyWithPlugins} from '../../../src';
import inlinePositioning, {
  getInlineBoundingClientRect,
} from '../../../src/plugins/inlinePositioning';
import inlinePositioningSnapshots from './__inlinePositioningSnapshots__';

setTestDefaultProps();
jest.useFakeTimers();

afterEach(cleanDocumentBody);

describe('inlinePositioning', () => {
  const tippy = createTippyWithPlugins([inlinePositioning]);

  it('true: sets popperInstance.reference = ReferenceObject onTrigger', () => {
    const instance = tippy(h(), {
      inlinePositioning: true,
      onTrigger(instance) {
        expect({}.toString.call(instance.popperInstance.reference)).toBe(
          '[object Object]',
        );
      },
    });

    instance.reference.dispatchEvent(MOUSEENTER);
    jest.runAllTimers();
  });

  it('false: does not set instance.popperInstance = ReferenceObject onTrigger', () => {
    const instance = tippy(h(), {
      inlinePositioning: false,
      onTrigger(instance) {
        expect(instance.popperInstance.reference).toBe(instance.reference);
      },
    });

    instance.reference.dispatchEvent(MOUSEENTER);
    jest.runAllTimers();
  });

  it('resets popperInstance.reference onHidden', () => {
    const instance = tippy(h(), {
      onHidden(instance) {
        expect(instance.popperInstance.reference).toBe(instance.reference);
      },
    });

    instance.reference.dispatchEvent(MOUSEENTER);
    jest.runAllTimers();
    instance.hide();
  });
});

describe('getInlineBoundingClientRect', () => {
  it('matches placement snapshots', () => {
    inlinePositioningSnapshots.forEach(snapshot => {
      expect(
        getInlineBoundingClientRect(
          snapshot.placement,
          snapshot.boundingRect,
          snapshot.clientRects,
        ),
      ).toEqual(snapshot.result);
    });
  });

  it('uses boundingRect if clientRects.length < 2', () => {
    const boundingRect = {};
    const clientRects = [{}];

    expect(
      getInlineBoundingClientRect('top', boundingRect, clientRects),
    ).toEqual(boundingRect);
  });
});
