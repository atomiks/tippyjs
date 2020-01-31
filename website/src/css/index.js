import React from 'react';
import {MEDIA} from '../components/Framework';
import {Global, css} from '@emotion/core';
import theme from './theme';

const MONOSPACE_FONT_STACK = `Menlo, "Dank Mono", Inconsolata, "Operator Mono", Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace`;

const core = css`
  html {
    height: 100%;
  }

  body {
    font-family: 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
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
      background: linear-gradient(45deg, #fff2df, #99ffec, #faa7ff);
      z-index: -1;
      transition: width 0.4s cubic-bezier(0.23, 1, 0.32, 1);
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
      background-color: rgba(0, 32, 128, 0.04);
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
    &.focus-visible {
      outline: 0;
      box-shadow: 0 0 0 2px rgb(255, 255, 255), 0 0 0 5px rgb(150, 180, 255);
    }
  }

  blockquote {
    border-left: 8px solid #ffc56d;
    background: #fff5c5;
    color: #333;
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
    &[data-inertia][data-state='visible'] {
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
    background: linear-gradient(130deg, #507bf4, #ff8bcb);
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
    background: linear-gradient(90deg, #9fe597, #cce581);
    color: #683b33;
    font-weight: bold;
  }
`;

const prism = css`
  code[class*='language-'],
  pre[class*='language-'] {
    font-family: ${MONOSPACE_FONT_STACK};
    color: #c6dbf4;
    background: none;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 2;
    font-size: 90%;
    -moz-tab-size: 2;
    -o-tab-size: 2;
    tab-size: 2;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }

  pre[class*='language-'] {
    padding: 20px 16px;
    margin-top: 0;
    margin-left: -16px;
    margin-right: -16px;
    background: #272642;
    font-size: 16px;
    line-height: 1.5;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    [data-elastic-wrapper] {
      display: inline-block;
    }

    ${MEDIA.sm} {
      margin-left: -25px;
      margin-right: -25px;
      padding: 20px 25px;
    }

    ${MEDIA.md} {
      border-radius: 8px;
      margin-left: 0;
      margin-right: 0;
      padding: 16px 25px;
      font-size: 17px;
    }
  }

  code.language-text {
    border: 1px solid ${theme.border};
    background: white;
    color: inherit;
    font-weight: bold;
    padding: 0.15em 0.4em;
    border-radius: 0.25em;
    line-height: inherit;
    font-size: 90%;
  }

  .token.important,
  .token.atrule,
  .token.keyword,
  .token.attribute {
    color: #d296ff;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #7f96cf;
  }

  .token.attr-name {
    color: #c3a2ff;
  }

  .token.selector {
    color: #ffc777;
  }

  .token.constant,
  .token.unit {
    color: #ff959c;
  }

  .token.punctuation {
    color: #93e2ff;
  }

  .token.block {
    color: #afcffa;
  }

  .token.tag .token.punctuation,
  .token.operator,
  .token.op,
  .token.module,
  .token.control {
    color: #93e2ff;
  }

  .token.nil {
    color: #9b9fb0;
  }

  .token.arrow {
    color: #c49dff;
    text-shadow: none;
  }

  .token.parameter {
    color: #fface4;
  }

  .token.flow {
    color: #89ddff;
    font-style: italic;
  }

  .token.spread {
    font-weight: bold;
    color: #ff7e99;
    text-shadow: 0px 1px 6px;
  }

  .namespace {
    opacity: 0.7;
  }

  .token.tag {
    color: #fa7692;
  }

  .token.number,
  .token.boolean,
  .token.symbol,
  .token.deleted {
    color: #ff9d74;
  }

  .token.string,
  .token.value,
  .language-css .token.string,
  .token.url,
  .token.attr-value,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #c3e88d;
  }

  .token.punctuation.quote {
    color: #89ddff;
  }

  .token.entity,
  .style .token.string {
    color: #ecd6ba;
  }

  .token.function,
  .language-css .token.property {
    color: #92afff;
    text-shadow: 0 0px 7px #0066ff, 0 1px 4px black;
  }

  .token.method,
  .language-css .token.function {
    color: #42c7ff;
  }

  .token.variable {
    color: #ffad92;
  }

  .token.dom,
  .token.class-name,
  .token.console,
  .token.object {
    color: #ffd181;
  }

  .token.property.definition {
    color: #77e0c6;
  }

  .token.property.access {
    color: #b8c7fc;
  }

  .token.regex {
    color: #88ecff;
  }

  .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }

  .token.entity {
    cursor: help;
  }

  .gatsby-highlight {
    position: relative;
    margin-top: 24px;
    margin-bottom: 24px;

    ${MEDIA.md} {
      margin-left: -25px;
      margin-right: -25px;
    }

    &[data-language='html']::before {
      color: #ffafaf;
    }

    &[data-language='js']::before {
      color: #ffd789;
    }

    &[data-language='css']::before {
      color: #8fdeff;
    }

    &[data-language='bash']::before {
      color: #d2adff;
    }

    &::before {
      content: attr(data-language);
      display: block;
      position: absolute;
      font-weight: bold;
      font-family: ${MONOSPACE_FONT_STACK};
      color: white;
      margin-top: 6px;
      text-transform: uppercase;
      font-size: 15px;
      text-align: right;
      pointer-events: none;
      width: calc(100% + 10px);

      ${MEDIA.md} {
        width: calc(100% - 10px);
      }
    }
  }

  a code.language-text {
    color: inherit;
  }
`;

function CSS() {
  return (
    <>
      <Global styles={core} />
      <Global styles={tippy} />
      <Global styles={prism} />
    </>
  );
}

export default CSS;
