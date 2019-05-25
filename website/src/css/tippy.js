import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
  .tippy-tooltip.ajax-theme {
    position: absolute;
    width: 200px;
    padding: 0;
    overflow: hidden;

    img {
      display: block;
      max-width: 100%;
    }
  }

  .tippy-tooltip.tomato-theme[data-placement^='top'] .tippy-arrow {
    border-top-color: tomato;
  }
  .tippy-tooltip.tomato-theme[data-placement^='top'] .tippy-arrow {
    border-bottom-color: tomato;
  }

  .tippy-tooltip.tomato-theme {
    font-weight: bold;
    color: yellow;
    background: tomato;

    &[data-animatefill] {
      background-color: transparent;
    }

    .tippy-backdrop {
      background: tomato;
    }

    .tippy-svgArrow {
      fill: tomato;
    }
  }

  .tippy-tooltip.scaled-arrow-theme .tippy-arrow {
    transform: scale(1.5);
  }

  .tippy-tooltip.dropdown-theme {
    text-align: left;
    font-size: 95%;
  }

  .tippy-tooltip.crazy-inertia-theme {
    &[data-inertia][data-state="visible"] {
      transition-timing-function: cubic-bezier(0.54, 100, 0.2, 0.26);
    }
  }
`
