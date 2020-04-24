/**
 * @jest-environment puppeteer
 */
import {navigateToTest, screenshotTest} from '../utils';

describe('inlinePositioning', () => {
  it('aligns correctly', async () => {
    const page = await browser.newPage();
    await page.setViewport({width: 1200, height: 800});

    await page.goto('http://host.docker.internal:5000');
    await navigateToTest(page, 'inlinePositioning');

    expect(
      await screenshotTest(page, 'inlinePositioning')
    ).toMatchImageSnapshot();
  });
});
