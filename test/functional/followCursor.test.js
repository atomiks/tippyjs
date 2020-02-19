/**
 * @jest-environment puppeteer
 */
import {navigateToTest, screenshotTest} from '../utils';

function generateSelector(option) {
  return `#followCursor [data-option="${option}"]`;
}

describe('followCursor', () => {
  describe('true', () => {
    it('follows the cursor on both axes', async () => {
      const selector = generateSelector(true);
      const page = await browser.newPage();

      await page.setViewport({width: 1200, height: 800});
      await page.goto('http://localhost:5000');
      await navigateToTest(page, 'followCursor');

      const reference = await page.$(selector);
      const rect = await page.evaluate(ref => {
        const {top, left} = ref.getBoundingClientRect();
        return {top, left};
      }, reference);

      await page.hover(selector);
      await page.waitFor(60);
      await page.mouse.move(rect.left + 15, rect.top + 20);

      expect(await screenshotTest(page, 'followCursor')).toMatchImageSnapshot();
    });
  });

  describe('false', () => {
    it('does not follow the cursor at all', async () => {
      const selector = generateSelector(false);
      const page = await browser.newPage();

      await page.setViewport({width: 1200, height: 800});
      await page.goto('http://localhost:5000');
      await navigateToTest(page, 'followCursor');

      const reference = await page.$(selector);
      const rect = await page.evaluate(ref => {
        const {top, left} = ref.getBoundingClientRect();
        return {top, left};
      }, reference);

      await page.hover(selector);
      await page.waitFor(60);
      await page.mouse.move(rect.left + 15, rect.top + 20);

      expect(await screenshotTest(page, 'followCursor')).toMatchImageSnapshot();
    });
  });

  describe('horizontal', () => {
    it('follows the cursor only on the horizontal axis', async () => {
      const selector = generateSelector('horizontal');
      const page = await browser.newPage();

      await page.setViewport({width: 1200, height: 800});
      await page.goto('http://localhost:5000');
      await navigateToTest(page, 'followCursor');

      const reference = await page.$(selector);
      const rect = await page.evaluate(ref => {
        const {top, left} = ref.getBoundingClientRect();
        return {top, left};
      }, reference);

      await page.hover(selector);
      await page.waitFor(60);
      await page.mouse.move(rect.left + 15, rect.top + 20);

      expect(await screenshotTest(page, 'followCursor')).toMatchImageSnapshot();
    });
  });

  describe('vertical', () => {
    it('follows the cursor only on the vertical axis', async () => {
      const selector = generateSelector('vertical');
      const page = await browser.newPage();

      await page.setViewport({width: 1200, height: 800});
      await page.goto('http://localhost:5000');
      await navigateToTest(page, 'followCursor');

      const reference = await page.$(selector);
      const rect = await page.evaluate(ref => {
        const {top, left} = ref.getBoundingClientRect();
        return {top, left};
      }, reference);

      await page.hover(selector);
      await page.waitFor(60);
      await page.mouse.move(rect.left + 15, rect.top + 20);

      expect(await screenshotTest(page, 'followCursor')).toMatchImageSnapshot();
    });
  });

  describe('initial', () => {
    it('follows the cursor only initially', async () => {
      const selector = generateSelector('initial');
      const page = await browser.newPage();

      await page.setViewport({width: 1200, height: 800});
      await page.goto('http://localhost:5000');
      await navigateToTest(page, 'followCursor');

      const reference = await page.$(selector);
      const rect = await page.evaluate(ref => {
        const {top, left} = ref.getBoundingClientRect();
        return {top, left};
      }, reference);

      await page.hover(selector);
      await page.waitFor(60);
      await page.mouse.move(rect.left, rect.top);

      expect(await screenshotTest(page, 'followCursor')).toMatchImageSnapshot();
    });
  });
});
