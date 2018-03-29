import { h } from 'hyperapp'
import pkg from '../../../package.json'

import * as DemoComponent from './Demo'
import * as GettingStartedComponent from './GettingStarted'
import * as CreatingTooltipsComponent from './CreatingTooltips'
import * as CustomizingTooltipsComponent from './CustomizingTooltips'
import * as AllOptionsComponent from './AllOptions'
import * as PropsComponent from './Props'
import * as MethodsComponent from './Methods'
import * as CreatingHTMLTemplatesComponent from './CreatingHTMLTemplates'
import * as CreatingCustomThemesComponent from './CreatingCustomThemes'
import * as BrowserSupportComponent from './BrowserSupport'
import * as PerformanceComponent from './Performance'

const { view: Demo } = DemoComponent
const { view: GettingStarted } = GettingStartedComponent
const { view: CreatingTooltips } = CreatingTooltipsComponent
const { view: CustomizingTooltips } = CustomizingTooltipsComponent
const { view: AllOptions } = AllOptionsComponent
const { view: Props } = PropsComponent
const { view: Methods } = MethodsComponent
const { view: CreatingHTMLTemplates } = CreatingHTMLTemplatesComponent
const { view: CreatingCustomThemes } = CreatingCustomThemesComponent
const { view: BrowserSupport } = BrowserSupportComponent
const { view: Performance } = PerformanceComponent

export const actions = {
  demo: DemoComponent.actions,
  allOptions: AllOptionsComponent.actions,
  creatingHTMLTemplates: CreatingHTMLTemplatesComponent.actions
}

export const view = () => (state, { main: actions }) => (
  <main class="main">
    <div class="container main__body">
      <Demo actions={actions.demo} />
      <GettingStarted />
      <CreatingTooltips />
      <CustomizingTooltips />
      <AllOptions actions={actions.allOptions} />
      <Props />
      <Methods />
      <CreatingHTMLTemplates actions={actions.creatingHTMLTemplates} />
      <CreatingCustomThemes />
      <BrowserSupport />
      <Performance />
    </div>
  </main>
)
