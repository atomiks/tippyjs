import { createGlobalStyle } from 'styled-components'
import { MEDIA } from '../components/Framework'

export default createGlobalStyle`
  html {
    box-sizing: border-box;
    height: 100%;
  }

  *,
  *::after,
  *::before {
    box-sizing: inherit;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    margin: 0;
    color: #515168;
    height: 100%;
    font-size: 16px;
    -webkit-tap-highlight-color: transparent;

    ${MEDIA.md} {
      font-size: 17px;
    }
  }

  :focus:not(.focus-visible) {
    outline: 0;
  }

  &::-moz-selection {
    background: #333;
    color: white;
  }
  &::selection {
    background: #333;
    color: white;
  }

  pre code::-moz-selection,
  pre span::-moz-selection {
    background-color: rgba(200, 210, 255, 0.25);
    color: inherit;
  }
  pre code::selection,
  pre span::selection {
    background-color: rgba(200, 210, 255, 0.25);
    color: inherit;
  }
  
  a {
    color: #0065d5;
    text-decoration: none;
  }

  h1, 
  h2, 
  h3, 
  h4, 
  h5, 
  h6 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;

    > a {
      color: inherit;
    }
  }

  h3 {
    > a {
      display: inline-block;
      position: relative;
      color: inherit;
      text-shadow: -2px 2px 0px #fbedff, -4px 4px 0px #fff;
      color: #3b69dd;
      padding: 10px 0;
      transition: color 0.3s;

      &::-moz-selection {
        text-shadow: none;
      }

      &::selection {
        text-shadow: none;
      }

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: calc(50% + 40px);
        margin-left: -25px;
        background: linear-gradient(90deg,#faf3e0,#fbedff);
        z-index: -1;
        transition: width 0.7s cubic-bezier(.23, 1, .32, 1);
        border-radius: 3px;
      }

      &:hover {
        color: #00acff;
      }

      &:hover::before {
        width: calc(100% + 25px);
      }

      ${MEDIA.md} {
        &:hover::before {
          width: calc(100% + 50px);
        }
      }

      code.language-text {
        background: none;
        color: inherit;
        font-size: 100%;
        padding: 0;

        &::-moz-selection {
          text-shadow: none;
        }

        &::selection {
          text-shadow: none;
        }
      }
    }
  }

  h1 {
    font-size: 2.488rem;
    margin-top: 2.488rem;
  }

  h2 {
    font-size: 2.074rem;
    margin-top: 2.074rem;
    border-bottom: 1px solid rgba(0, 32, 128, 0.1);
    padding-bottom: 10px;
    margin-bottom: 1.5rem;
    font-weight: 600;

    ${MEDIA.md} {
      font-size: 2.488rem;
    }
  }

  h3 {
    font-size: 1.728rem;
    margin-top: 2.5rem;

    ${MEDIA.md} {
      font-size: 2.074rem;
    }
  }

  h4 {
    font-size: 1.44rem;
    margin-top: 2.2rem;

    ${MEDIA.md} {
      font-size: 1.728rem;
    }
  }

  h5 {
    font-size: 1.44rem;
  }

  p, 
  li {
    line-height: 1.6;
    margin-top: 0.5rem;
  }

  ul {
    padding-left: 18px;
  }

  table {
    box-shadow: 0 0 0 1px rgba(0,32,128,0.1);
    border-collapse: collapse;
    margin: 0;
    padding: 0;
    line-height: 1.4;
    border-radius: 0 0 10px 10px;
    font-size: 16px;

    ${MEDIA.xl} {
      width: calc(100% + 50px);
      margin-left: -25px;
    }
  }

  table tr {
    padding: 5px;

    &:not(:last-child) {
      border-bottom: 1px dotted rgba(0,32,128,0.1);
    }
  }

  td:first-child code {
    background: none;
    font-size: 18px;
    color: #333;
    padding: 0;
  }

  th:last-child, td:last-child {
    padding-left: 25px;
  }

  table th, table td {
    text-align: left;
    padding: 15px;

    ${MEDIA.xl} {
      padding: 15px 25px;
    }
  }

  table th {
    position: relative;
    z-index: 1;
    font-size: 14px;
    text-transform: uppercase;
    background: #eeeefa;
    position: sticky;
    top: 0;
  }

  @media (max-width: 1150px) {
    table {
      border: 0;
      box-shadow: none;
    }

    table thead {
      display: none;
    }

    table tr {
      border: 1px solid rgba(0,32,128,0.1);
      display: block;
      margin-bottom: 10px;
      border-radius: 10px;
    }

    table td {
      display: block;

      &:not(:last-child) {
        border-bottom: 1px dotted rgba(0,32,128,0.1);
      }
    }

    table td:last-child {
      border-bottom: 0;
    }

    th:last-child, td:last-child {
      padding-left: 15px;
    }

    table td::before {
      content: attr(data-label);
      display: block;
      font-weight: bold;
      text-transform: uppercase;
      opacity: 0.7;
      font-size: 13px;
      margin-bottom: 5px;
    }

    td:first-child code {
      font-size: 100%;
    }
  }

  hr {
    border: none;
    border-top: 1px solid rgba(0, 16, 64, 0.15);
    margin-top: 5px;
  }

  [data-reach-skip-link] {
    position: fixed;
    z-index: 2;
    padding: 10px;
    left: -9999px;
    background: white;
    border-radius: 4px;
    font-weight: bold;
    font-size: 15px;

    &:focus {
      left: 5px;
      top: 5px;
    }
  }
`
