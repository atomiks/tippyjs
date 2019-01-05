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

  .tippy-tooltip.tomato-theme {
    font-weight: bold;
    color: yellow;

    .tippy-backdrop {
      background: tomato;
    }
  }
`
