/**
 * @jest-environment puppeteer
 */
import {navigateToTest, screenshotTest} from '../utils';

describe('sticky', () => {
  it('stays stuck to the reference element when it moves', async () => {
    const page = await browser.newPage();
    await page.setViewport({width: 1200, height: 800});

    await page.goto('http://host.docker.internal:5000');
    await navigateToTest(page, 'sticky');

    expect(await screenshotTest(page, 'sticky')).toMatchImageSnapshot();
  });
});
