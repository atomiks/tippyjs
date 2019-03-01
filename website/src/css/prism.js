import { createGlobalStyle } from 'styled-components'
import { MEDIA } from '../components/Framework'

const MONOSPACE_FONT_STACK = `Inconsolata, "Operator Mono", "Roboto Mono", "Dank Mono", Menlo, Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace`

export default createGlobalStyle`
  code,
  pre {
    font-family: ${MONOSPACE_FONT_STACK};
  }

  code[class*='language-'],
  pre[class*='language-'] {
    color: #cee6ff;
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
    padding: 16px 5%;
    margin-top: 0;
    margin-left: -5.55%;
    margin-right: -5.55%;
    background: #22223f;
    font-size: 17px;
    line-height: 1.5;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    [data-elastic-wrapper] {
      display: inline-block;
    }

    ${MEDIA.sm} {
      margin-left: -25px;
      margin-right: -25px;
      padding: 16px 25px;
    }

    ${MEDIA.md} {
      border-radius: 0 0 8px 8px;
      margin-left: 0;
      margin-right: 0;
      padding: 16px 25px;
      font-size: 18px;
    }
  }

  code.language-text {
    background: #eeeefa;
    color: #333;
    font-weight: bold;
    padding: 0.2em 0.4em;
    border-radius: 4px;
    line-height: inherit;
    font-size: 95%;
  }

  .token.important,
  .token.atrule,
  .token.keyword {
    color: #c7a2ff;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #7692d9;
  }

  .token.attr-name,
  .token.selector {
    color: #ffb07b;
  }

  .token.boolean {
    color: #ff959c;
  }

  .token.punctuation,
  .token.operator,
  .token.op,
  .token.module {
    color: #6ed3ff;
  }

  .token.nil {
    color: #9b9fb0;
  }

  .token.arrow {
    color: #c49dff;
  }

  .token.parameter {
    color: #ffc5ff;
  }

  .token.flow {
    color: #8cedff;
    font-style: italic;
    font-weight: bold;
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
    color: #ff6c8b;
  }

  .token.number,
  .token.symbol,
  .token.deleted {
    color: #ff8d5d;
  }

  .token.string,
  .language-css .token.string,
  .token.url,
  .token.attr-value,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #5af4c4;
  }

  .token.entity,
  .style .token.string {
    color: #ecd6ba;
    text-shadow: 0 1px 3px transparentize(#ecd6ba, 0.5);
  }

  .token.function,
  .token.property {
    color: #5eb9ff;
  }

  .token.method {
    color: #00d3ed;
  }

  .token.variable {
    color: #ffad92;
  }

  .token.dom,
  .token.class-name {
    color: #ffd278;
  }

  .token.property.definition {
    color: #b6f69a;
  }

  .token.property.access {
    color: #8ec1ef;
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
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  
    ${MEDIA.md} {
      margin-left: -25px;
      margin-right: -25px;
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
      width: 111.1%;
      position: absolute;
      background: #43436a;
      font-weight: bold;
      padding: 8px 8px;
      font-family: ${MONOSPACE_FONT_STACK};
      color: white;
      margin-left: -5.55%;
      padding-left: 5%;
      text-transform: uppercase;
      transform: translateY(-100%);
      font-size: 18px;

      ${MEDIA.sm} {
        width: calc(100% + 50px);
        margin-left: -25px;
        padding-left: 25px;
      }

      ${MEDIA.md} {
        margin-left: 0;
        border-radius: 8px 8px 0 0;
        width: 100%;
      }
    }
  }

  a code.language-text {
    color: inherit;
  }
`
