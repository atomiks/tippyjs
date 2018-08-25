import { h } from 'hyperapp'

import Demo from './Demo'
import Why from './Why'
import GettingStarted from './GettingStarted'
import CreatingTooltips from './CreatingTooltips'
import CustomizingTooltips from './CustomizingTooltips'
import AllOptions from './AllOptions'
import Objects from './Objects'
import Methods from './Methods'
import HTMLContent from './HTMLContent'
import CreatingCustomThemes from './CreatingCustomThemes'
import BrowserSupport from './BrowserSupport'
import Performance from './Performance'
import ViewLibraryWrappers from './ViewLibraryWrappers'

export default () => (
  <main class="main">
    <div class="container main__body">
      <Demo />
      <Why />
      <GettingStarted />
      <CreatingTooltips />
      <CustomizingTooltips />
      <AllOptions />
      <Objects />
      <Methods />
      <HTMLContent />
      <CreatingCustomThemes />
      <ViewLibraryWrappers />
      <BrowserSupport />
      <Performance />
    </div>
  </main>
)
