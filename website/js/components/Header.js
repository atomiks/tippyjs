import { h } from 'hyperapp'
import logo from '../../assets/img/logo.svg'
import { version } from '../../../package.json'
import { animateLogo, animateVersion, animateItems } from '../utils'
import Emoji from './Emoji'
import Tippy from './Tippy'

export default () => (
  <header class="header">
    <div class="container">
      <img class="header__logo" src={logo} oncreate={animateLogo} />
      <div class="header__heading-wrapper">
        <h1 class="header__heading">
          Tippy.js
          <span
            oncreate={animateVersion}
            class="header__version"
            style={{
              opacity: 0,
              transform: 'scale(0.8)'
            }}
          >
            v{version}
          </span>
        </h1>
      </div>
      <h2 class="header__slogan">
        A highly customizable vanilla JS tooltip & popover library
      </h2>
      <div
        oncreate={animateItems}
        class="header__items"
        style={{
          opacity: 0,
          transform: 'translateY(50px)'
        }}
      >
        <div class="header__item">
          <p>
            <Emoji small>💎</Emoji>14 kB
          </p>
        </div>
        <div class="header__item">
          <Tippy
            content="Popper.js is the <strong>positioning engine</strong> behind the tooltips."
            arrow={true}
            theme="light"
            offset="0, 2"
            sticky="true"
            updateDuration="250"
            arrowType="round"
          >
            <a
              class="header__button"
              href="https://popper.js.org/"
              target="_blank"
            >
              <Emoji small>⚡</Emoji>
              Powered by Popper.js
            </a>
          </Tippy>
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
