import { h } from 'hyperapp'

import Demo from './Demo'
import TableOfContents from './TableOfContents'
import Why from './Why'
import GettingStarted from './GettingStarted'
import CreatingTooltips from './CreatingTooltips'
import CustomizingTooltips from './CustomizingTooltips'
import AllOptions from './AllOptions'
import Objects from './Objects'
import Methods from './Methods'
import HTMLContent from './HTMLContent'
import CreatingCustomThemes from './CreatingCustomThemes'
import Performance from './Performance'

export default () => (
  <main class="main">
    <div class="container main__body">
      <Demo />
      <TableOfContents />
      <Why />
      <GettingStarted />
      <CreatingTooltips />
      <CustomizingTooltips />
      <AllOptions />
      <Objects />
      <Methods />
      <HTMLContent />
      <CreatingCustomThemes />
      <Performance />
    </div>
  </main>
)
