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
    font-family: 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
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

    &:hover {
      text-decoration: underline;
    }
  }

  h1, 
  h2, 
  h3, 
  h4, 
  h5, 
  h6 {
    position: relative;
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;

    &:hover .link-icon {
      opacity: 1;
    }
  }

  h1 {
    font-size: 2.488rem;
    margin-top: 2.488rem;
  }

  h2 {
    font-size: 2rem;
    display: inline-block;
    color: inherit;
    text-shadow: -2px 2px 0px #ffffff, -4px 4px 0px #aeffce;
    color: #7037d5;
    padding: 10px 0;
    transition: color 0.3s;

    &::-moz-selection {
      background: rgba(0, 160, 255, 0.5);
      text-shadow: none;
    }

    &::selection {
      background: rgba(0, 160, 255, 0.5);
      text-shadow: none;
    }

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: calc(15% + 40px);
      margin-left: -25px;
      background: linear-gradient(90deg,#ded1ff,#80fff9);
      z-index: -1;
      transition: width 0.4s cubic-bezier(.23, 1, .32, 1);
      border-radius: 3px;
    }

    ${MEDIA.md} {
      font-size: 2.75rem;
    }
  }

  h3 {
    font-size: 1.728rem;
    margin-top: 2.5rem;
    padding-right: 30px;

    ${MEDIA.md} {
      font-size: 2.074rem;
    }
  }

  h4 {
    font-size: 1.44rem;
    margin-top: 2.2rem;
    color: #666c80;

    ${MEDIA.md} {
      font-size: 1.728rem;
    }
  }

  h5 {
    font-size: 1.44rem;
    color: #666c80;
  }

  .link-icon {
    display: inline-block;
    position: absolute;
    padding: 10px 0;
    opacity: 0;
    transition: opacity 0.2s;
    width: 30px;
    top: -10px;
    right: 0;
    color: #5b36df;

    &:hover,
    &:focus {
      opacity: 1;
      text-decoration: none;
    }

    ${MEDIA.md} {
      right: initial;
      left: -30px;

      &:focus {
        width: 20px;
      }
    }
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
    font-size: 16px;
    color: #333;
    padding: 0;
  }

  th:last-child, td:last-child {
    padding-left: 25px;
  }

  td:first-child,
  td:nth-child(3) {
    padding-right: 0;
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

  button,
  a {
    &.focus-visible {
      outline: 0;
      box-shadow: 0 0 0 2px rgb(255, 255, 255), 0 0 0 5px rgb(150, 180, 255);
    }
  }

  blockquote {
    color: #828fa1;
    border-left: 5px solid #ced4dd;
    margin: 0;
    padding-left: 15px;
  }
`
