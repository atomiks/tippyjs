import {createGlobalStyle} from 'styled-components';
import {MEDIA} from '../components/Framework';

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
    font-family: 'X', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
    margin: 0;
    color: #515168;
    height: 100%;
    font-size: 17px;
    -webkit-tap-highlight-color: transparent;

    ${MEDIA.md} {
      font-size: 18px;
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
    color: #5183f5;
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
    margin-bottom: 16px;
    color: #333;

    &:hover .link-icon {
      opacity: 1;
    }
  }

  h1 {
    font-size: 40px;
    margin-top: 40px;
  }

  h2 {
    font-size: 48px;
    display: inline-block;
    color: inherit;
    text-shadow: -2px 2px 0px #ffffff, -4px 3px 0px #ffffff;
    color: #7761d1;
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
      background: linear-gradient(45deg,#fff2df,#99ffec,#faa7ff);
      z-index: -1;
      transition: width 0.4s cubic-bezier(.23, 1, .32, 1);
      border-radius: 3px;
    }

    ${MEDIA.md} {
      font-size: 64px;
    }
  }

  h3 {
    font-size: 32px;
    margin-top: 60px;
    margin-bottom: 24px;
    padding-right: 30px;

    ${MEDIA.md} {
      font-size: 36px;
    }
  }

  h4 {
    font-size: 24px;
    margin-top: 35px;
    color: #666c80;

    ${MEDIA.md} {
      font-size: 28px;
    }
  }

  h5 {
    font-size: 22px;
    margin-top: 32px;
    color: #666c80;
    font-weight: 500;
  }

  p, 
  li {
    line-height: 1.6;
    margin-top: 8px;
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
      border-bottom: 2px dashed rgba(0,32,128,0.1);
    }

    &:nth-child(even) {
      background-color: rgba(0,32,128,0.04);
    }
  }

  td:first-child code {
    background: none;
    border: none;
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
    background: rgb(238, 238, 250);
    position: sticky;
    top: 0;

    @supports (backdrop-filter: none) or (-webkit-backdrop-filter: none) {
      backdrop-filter: saturate(180%) blur(5px);
      background: rgb(238, 238, 250, 0.4);
    }
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
    margin: 50px 0;
  }

  .plugin-prop {
    background: linear-gradient(45deg, #e1f8ff, rgba(171, 255, 107, 0.3));
  }

  [data-reach-skip-link] {
    position: fixed;
    z-index: 3;
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
`;
