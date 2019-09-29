import {createGlobalStyle} from 'styled-components';
import {MEDIA} from '../components/Framework';

const MONOSPACE_FONT_STACK = `Menlo, "Dank Mono", Inconsolata, "Operator Mono", Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace`;

export default createGlobalStyle`
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
    padding: 1.25rem 1rem;
    margin-top: 0;
    margin-left: -1rem;
    margin-right: -1rem;
    background: radial-gradient(50% 80% at 80% 0%,rgb(61, 59, 98),rgb(40, 40, 75));
    font-size: 1rem;
    line-height: 1.5;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    [data-elastic-wrapper] {
      display: inline-block;
    }

    ${MEDIA.sm} {
      margin-left: -1.5625rem;
      margin-right: -1.5625rem;
      padding: 1.25rem 1.5625rem;
    }

    ${MEDIA.md} {
      border-radius: 0.5rem;
      margin-left: 0;
      margin-right: 0;
      padding: 1rem 1.5625rem;
      font-size: 1.0625rem;
    }
  }

  code.language-text {
    color: #333;
    background: white;
    border: 1px solid;
    border-bottom-width: 2px;
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
    color: #d0aeff;
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
    text-shadow: 0 0 2px #000, 0 0 14px #46e3ff;
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
    color: #89DDFF;
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
    color: #C3E88D;
  }

  .token.punctuation.quote {
    color: #89DDFF;
  }

  .token.entity,
  .style .token.string {
    color: #ecd6ba;
    text-shadow: 0 1px 3px transparentize(#ecd6ba, 0.5);
  }

  .token.function,
  .language-css .token.property {
    color: #9bb5ff;
    text-shadow: 0 0 10px #2f36ff, 0 0 22px #9d91ff;
  }

  .token.method,
  .language-css .token.function {
    color: #67d2ff;
    text-shadow: 0 0px 10px #39c5ff, 0 0px 2px black;
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
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  
    ${MEDIA.md} {
      margin-left: -1.5625rem;
      margin-right: -1.5625rem;
    }

    &[data-language="html"]::before {
      color: #ffafaf;
    }

    &[data-language="js"]::before {
      color: #ffd789;
    }

    &[data-language="css"]::before {
      color: #8fdeff;
    }

    &[data-language="bash"]::before {
      color: #d2adff;
    }

    &::before {
      content: attr(data-language);
      display: block;
      position: absolute;
      font-weight: bold;
      padding: 8px 0.9375rem;
      font-family: ${MONOSPACE_FONT_STACK};
      color: white;
      width: calc(100% + 2rem);
      margin-left: -1rem;
      padding-left: 1rem;
      text-transform: uppercase;
      font-size: 0.9375rem;
      text-align: right;
      pointer-events: none;

      ${MEDIA.sm} {
        width: calc(100% + 50px);
        margin-left: -1.5625rem;
        padding-left: 1.5625rem;
      }

      ${MEDIA.md} {
        margin-left: 0;
        border-radius: 8px;
        width: 100%;
      }
    }
  }

  a code.language-text {
    color: inherit;
  }
`;
