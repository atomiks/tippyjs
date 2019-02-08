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

  .tippy-popper[x-placement^='top'] .tippy-tooltip.ajax-theme {
    top: auto !important;
    bottom: 0;
  }
  .tippy-popper[x-placement^='bottom'] .tippy-tooltip.ajax-theme {
    bottom: auto !important;
    top: 0;
  }

  .tippy-popper[x-placement^='top'] .tippy-tooltip.tomato-theme .tippy-arrow {
    border-top-color: tomato;
  }
  .tippy-popper[x-placement^='bottom'] .tippy-tooltip.tomato-theme .tippy-arrow {
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

    .tippy-roundarrow {
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
