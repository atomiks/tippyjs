import { h } from 'hyperapp'
import pkg from '../../../package.json'

import Demo from './Demo'
import GettingStarted from './GettingStarted'
import CreatingTooltips from './CreatingTooltips'
import CustomizingTooltips from './CustomizingTooltips'
import AllOptions from './AllOptions'
import Props from './Props'
import Methods from './Methods'
import CreatingHTMLTemplates from './CreatingHTMLTemplates'
import CreatingCustomThemes from './CreatingCustomThemes'
import BrowserSupport from './BrowserSupport'
import Performance from './Performance'

export default () => (state, actions) => (
  <main class="main">
    <div class="container main__body">
      <Demo />
      <GettingStarted />
      <CreatingTooltips />
      <CustomizingTooltips />
      <AllOptions />
      <Props />
      <Methods />
      <CreatingHTMLTemplates />
      <CreatingCustomThemes />
      <BrowserSupport />
      <Performance />
    </div>
  </main>
)
