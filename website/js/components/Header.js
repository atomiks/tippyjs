import { h } from 'hyperapp'
import logo from '../../assets/img/logo.svg'
import { version } from '../../../package.json'

export default () => (state, { header }) => (
  <header class="header">
    <div class="container">
      <img class="header__logo" src={logo} oncreate={header.animateLogo} />
      <div class="header__heading-wrapper">
        <h1 class="header__heading">
          Tippy.js
          <span oncreate={header.animateVersion} class="header__version">
            v{version}
          </span>
        </h1>
      </div>
      <h2 class="header__slogan">
        A highly customizable vanilla JS tooltip & popover library
      </h2>
      <div oncreate={header.animateItems} class="header__items">
        <div class="header__item">
          <p>
            <i class="header__icon is-code" data-feather="code" />
            14 kB gzipped
          </p>
        </div>
        <div class="header__item">
          <a
            class="header__button"
            href="https://popper.js.org/"
            target="_blank"
            title="Popper.js is the <strong>positioning engine</strong> behind the tooltips."
            data-tippy-animation="perspective"
            data-tippy-arrow="true"
            data-tippy-arrowType="round"
            data-tippy-maxWidth="200px"
            data-tippy-theme="light"
            data-tippy-offset="0, 2"
            data-tippy-updateDuration="250"
          >
            <i
              class="icon header__icon is-power"
              data-feather="cloud-lightning"
            />
            Powered by Popper.js
          </a>
        </div>
        <div class="header__item has-github-button">
          <a
            class="github-button"
            href="https://github.com/atomiks/tippyjs"
            data-size="large"
            data-count-href="/atomiks/tippyjs/stargazers"
            data-show-count="true"
            data-count-aria-label="# stargazers on GitHub"
            aria-label="Star atomiks/tippyjs on GitHub"
          >
            Star
          </a>
        </div>
        <div class="header__item">
          <p class="header__docs-wrapper">
            <a
              class="header__docs"
              href="https://atomiks.github.io/tippyjs/v1/index.html"
            >
              v1 docs
            </a>
          </p>
        </div>
      </div>
    </div>
  </header>
)
