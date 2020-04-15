/**
 * @jest-environment puppeteer
 */
import {navigateToTest, screenshotTest} from '../utils';

describe('border', () => {
  it('borders are correctly inherited and SVG styles are correct', async () => {
    const page = await browser.newPage();
    await page.setViewport({width: 1200, height: 800});

    await page.goto('http://host.docker.internal:5000');
    await navigateToTest(page, 'border');

    expect(await screenshotTest(page, 'border')).toMatchImageSnapshot();
  });
});
