import {createGlobalStyle} from 'styled-components';

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
  .tippy-tooltip.tomato-theme[data-placement^='bottom'] .tippy-arrow {
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

    .tippy-svg-arrow {
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

  .tippy-tooltip.large-arrow-theme .tippy-arrow {
    transform: scale(1.75);
  }

  .tippy-tooltip.small-arrow-theme .tippy-arrow {
    transform: scale(0.75);
  }

  .tippy-tooltip.wide-arrow-theme .tippy-arrow {
    transform: scaleX(1.5);
  }

  .tippy-tooltip.narrow-arrow-theme .tippy-arrow {
    transform: scale(0.6, 1.2);
  }

  .tippy-tooltip.gradient-theme {
    background: linear-gradient(130deg, #507bf4,#ff8bcb);
    box-shadow: 0 8px 12px #c9a0ff;
    font-weight: bold;
  }

  .tippy-tooltip.retro-theme {
    background: beige;
    border: 2px solid tomato;
    color: tomato;
    font-weight: bold;
  }

  .tippy-tooltip.forest-theme {
    background: linear-gradient(90deg,#9fe597, #cce581);
    color: #683b33;
    font-weight: bold;
  }
`;
