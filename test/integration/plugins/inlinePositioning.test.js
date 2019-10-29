import {fireEvent} from '@testing-library/dom';
import {h, cleanDocumentBody, setTestDefaultProps} from '../../utils';

import tippy from '../../../src';
import inlinePositioning, {
  getInlineBoundingClientRect,
} from '../../../src/plugins/inlinePositioning';
import inlinePositioningSnapshots from './__inlinePositioningSnapshots__';

setTestDefaultProps({plugins: [inlinePositioning]});
jest.useFakeTimers();

afterEach(cleanDocumentBody);

describe('inlinePositioning', () => {
  it('true: sets popperInstance.reference = ReferenceObject onShow', () => {
    const instance = tippy(h(), {
      inlinePositioning: true,
      onShow(instance) {
        expect({}.toString.call(instance.popperInstance.reference)).toBe(
          '[object Object]',
        );
      },
    });

    fireEvent.mouseEnter(instance.reference);
    jest.runAllTimers();
  });

  it('false: does not set instance.popperInstance = ReferenceObject onShow', () => {
    const instance = tippy(h(), {
      inlinePositioning: false,
      onShow(instance) {
        expect(instance.popperInstance.reference).toBe(instance.reference);
      },
    });

    fireEvent.mouseEnter(instance.reference);
    jest.runAllTimers();
  });

  it('resets popperInstance.reference onHidden', () => {
    const instance = tippy(h(), {
      onHidden(instance) {
        expect(instance.popperInstance.reference).toBe(instance.reference);
      },
    });

    fireEvent.mouseEnter(instance.reference);
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
