import React from 'react';
import {MEDIA} from '../components/Framework';
import {Global, css} from '@emotion/core';

const MONOSPACE_FONT_STACK = `Menlo, "Dank Mono", Inconsolata, "Operator Mono", Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace`;

const core = css`
  html {
    height: 100%;
  }

  body {
    font-family: 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
    margin: 0;
    background-color: #1f2028;
    color: #bfc3d9;
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
    color: #7cbbff;
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
    color: #fff;
    word-break: break-word;

    &:hover .link-icon {
      opacity: 1;
    }

    .link-icon.focus-visible {
      outline: 0;
      box-shadow: 0 0 0 1px;
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
    text-shadow: -2px 2px 0px #000, -4px 3px 0px #000;
    color: #fff;
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
      background: linear-gradient(45deg, #0058ff, #df72a1, #f7ffbb);
      z-index: -1;
      transition: width 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      border-radius: 3px;
    }

    ${MEDIA.md} {
      font-size: 64px;
    }
  }

  h3 {
    font-size: 28px;
    margin-top: 60px;
    margin-bottom: 24px;
    padding-right: 30px;

    ${MEDIA.sm} {
      font-size: 32px;
    }

    ${MEDIA.md} {
      font-size: 36px;
    }
  }

  h4 {
    font-size: 24px;
    margin-top: 35px;

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
    margin-top: 12px;
  }

  ul {
    padding-left: 18px;
  }

  table {
    box-shadow: 0 0 0 1px rgba(0, 32, 128, 0.1);
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

    &:not(:last-of-type) {
      border-bottom: 2px dashed rgba(0, 32, 128, 0.1);
    }

    &:nth-of-type(even) {
      background-color: #272935;
    }
  }

  td:first-of-type code {
    background: none;
    border: none;
    font-size: 18px;
    padding: 0;
  }

  th:last-of-type,
  td:last-of-type {
    padding-left: 25px;
  }

  table th,
  table td {
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
    background: rgba(119, 97, 209, 0.8);
    backdrop-filter: blur(5px);
    color: white;
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
      border: 1px solid rgba(0, 32, 128, 0.1);
      display: block;
      margin-bottom: 10px;
      border-radius: 10px;
    }

    table td {
      display: block;

      &:not(:last-of-type) {
        border-bottom: 1px dotted rgba(0, 32, 128, 0.1);
      }
    }

    table td:last-of-type {
      border-bottom: 0;
    }

    th:last-of-type,
    td:last-of-type {
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

    td:first-of-type code {
      font-size: 100%;
    }
  }

  hr {
    border: none;
    border-top: 1px solid rgba(0, 16, 64, 0.15);
    margin: 50px 0;
  }

  table tr.plugin-prop {
    background-color: rgba(180, 255, 210, 0.5);
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
    &.focus-visible:not(.link-icon) {
      outline: 0;
      box-shadow: 0 0 0 2px rgb(0, 0, 0), 0 0 0 4px rgb(100, 150, 255);
    }
  }

  blockquote {
    border-left: 5px solid #6db4ff;
    background: #323b57;
    color: #fff;
    margin: 0;
    padding: 5px 15px;
    margin-left: -15px;
    margin-right: -15px;
    border-radius: 0 8px 8px 0;
    font-size: 95%;
    margin-bottom: 15px;

    ${MEDIA.md} {
      padding: 5px 20px;
      margin-left: -25px;
      margin-right: -25px;
    }

    p {
      margin-bottom: 10px;
    }
  }
`;

const tippy = css`
  .tippy-backdrop {
    background: #3e55e1;
  }

  .tippy-svg-arrow {
    fill: #3e55e1;
  }

  .tippy-backdrop ~ .tippy-box {
    box-shadow: none;
  }

  .tippy-box {
    background: #3e55e1;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);

    &[data-placement^='top'] {
      > .tippy-arrow::before {
        border-top-color: #3e55e1;
      }
    }

    &[data-placement^='bottom'] {
      > .tippy-arrow::before {
        border-bottom-color: #3e55e1;
      }
    }

    &[data-placement^='left'] {
      > .tippy-arrow::before {
        border-left-color: #3e55e1;
      }
    }

    &[data-placement^='right'] {
      > .tippy-arrow::before {
        border-right-color: #3e55e1;
      }
    }
  }

  .tippy-box[data-theme~='default'] {
    background: #424557;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);

    &[data-placement^='top'] {
      > .tippy-arrow::before {
        border-top-color: #424557;
      }
    }

    &[data-placement^='bottom'] {
      > .tippy-arrow::before {
        border-bottom-color: #424557;
      }
    }

    &[data-placement^='left'] {
      > .tippy-arrow::before {
        border-left-color: #424557;
      }
    }

    &[data-placement^='right'] {
      > .tippy-arrow::before {
        border-right-color: #424557;
      }
    }
  }

  .tippy-box[data-theme~='ajax'] {
    position: absolute;
    width: 200px;
    padding: 0;
    overflow: hidden;

    img {
      display: block;
      max-width: 100%;
    }
  }

  .tippy-box[data-theme~='tomato'] {
    font-weight: bold;
    color: yellow;
    background: tomato;

    &[data-placement^='top'] {
      > .tippy-arrow::before {
        border-top-color: tomato;
      }
    }

    &[data-placement^='bottom'] {
      > .tippy-arrow::before {
        border-bottom-color: tomato;
      }
    }

    .tippy-backdrop {
      background: tomato;
    }

    .tippy-svg-arrow {
      fill: tomato;
      transform: scale(2);
    }
  }

  .tippy-box[data-theme~='scaled-arrow'] > .tippy-arrow::before {
    transform: scale(1.25);
  }

  .tippy-box[data-theme~='large-arrow'] > .tippy-arrow::before {
    transform: scale(1.75);
  }

  .tippy-box[data-theme~='small-arrow'] > .tippy-arrow::before {
    transform: scale(0.75);
  }

  .tippy-box[data-theme~='wide-arrow'] > .tippy-arrow::before {
    transform: scaleX(1.5);
  }

  .tippy-box[data-theme~='narrow-arrow'] > .tippy-arrow::before {
    transform: scale(0.6, 1.2);
  }

  .tippy-box[data-theme~='gradient'] {
    background: linear-gradient(130deg, #507bf4, #ff8bcb);
    box-shadow: 0 8px 12px #402860;
    font-weight: bold;
  }

  .tippy-box[data-theme~='retro'] {
    background: beige;
    border: 2px solid tomato;
    color: tomato;
    font-weight: bold;
  }

  .tippy-box[data-theme~='forest'] {
    background: linear-gradient(90deg, #9fe597, #cce581);
    color: #683b33;
    font-weight: bold;
  }
`;

const code = css`
  code:not(.grvsc-code) {
    color: #81edff;
    font-family: ${MONOSPACE_FONT_STACK};
    padding: 0.15em 0.25em;
    border-radius: 0.25em;
    line-height: inherit;
    font-size: 90%;
    background: none;
  }

  .grvsc-container {
    border-radius: 0 !important;
    overflow-x: none !important;

    ${MEDIA.sm} {
      border-radius: 10px !important;
    }
  }

  .moonlight-ii {
    background-color: #272935 !important;
    margin-left: -16px;
    margin-right: -16px;

    ${MEDIA.md} {
      margin-left: -25px;
      margin-right: -25px;
    }
  }

  .grvsc-line {
    padding: 0 15px !important;

    ${MEDIA.sm} {
      padding: 0 25px !important;
    }
  }

  .grvsc-code {
    font-family: ${MONOSPACE_FONT_STACK};
    line-height: 2;
    font-size: 15px;

    ${MEDIA.sm} {
      font-size: 16px;
    }
  }
`;

function CSS() {
  return (
    <>
      <Global styles={core} />
      <Global styles={tippy} />
      <Global styles={code} />
    </>
  );
}

export default CSS;
