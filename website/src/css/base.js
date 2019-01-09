import { createGlobalStyle } from 'styled-components'

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
    font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    margin: 0;
    color: #324b64;
    height: 100%;
    font-size: 17px;
    -webkit-tap-highlight-color: transparent;
  }

  :focus:not(.focus-visible) {
    outline: 0;
  }

  &::-moz-selection {
    background: #a886ff;
    color: white;
  }
  &::selection {
    background: #a886ff;
    color: white;
  }
  
  a {
    color: #0065d5;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-bottom-color 0.15s;

    &:hover {
      border-bottom-color: inherit;
    }
  }

  h1, 
  h2, 
  h3, 
  h4, 
  h5, 
  h6 {
    margin-top: 0;
    margin-bottom: 1rem;

    > a {
      color: inherit;
      padding-bottom: 0.25rem;
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
  }

  h3 {
    font-size: 1.728rem;
    margin-top: 1.728rem;
  }

  h4 {
    font-size: 1.44rem;
    margin-top: 1.5rem;
  }

  h5 {
    font-size: 1.2rem;
  }

  p, 
  li {
    line-height: 1.6;
    margin-top: 0.5rem;
  }

  table {
    box-shadow: 0 0 0 1px rgba(0,32,128,0.1);
    border-collapse: collapse;
    margin: 0;
    padding: 0;
    width: 100%;
    line-height: 1.4;
    border-radius: 0 0 10px 10px;
  }

  table tr {
    padding: 5px;

    &:not(:last-child) {
      border-bottom: 1px dotted rgba(0,32,128,0.1);
    }
  }

  td:first-child code {
    background: none;
    font-size: 90%;
    color: inherit;
    padding: 0;
  }

  table th, table td {
    padding: 16px;
    text-align: left;
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
`
