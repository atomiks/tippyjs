import { createGlobalStyle } from 'styled-components'
import { MEDIA } from '../components/Framework'

const MONOSPACE_FONT_STACK = `Menlo, "Dank Mono", Inconsolata, "Operator Mono", Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", "Courier New", Courier, monospace`

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
    padding: 20px 5%;
    margin-top: 0;
    margin-left: -5.55%;
    margin-right: -5.55%;
    background: radial-gradient(50% 80% at 80% 0%, rgb(56, 50, 87), rgb(33, 33, 57));
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
    background: #eeeefa;
    color: #333;
    font-weight: bold;
    padding: 0.2em 0.4em;
    border-radius: 4px;
    line-height: inherit;
    font-size: 90%;
  }

  .token.important,
  .token.atrule,
  .token.keyword {
    color: #c3a2ff;
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
    color: #89DDFF;
  }

  .token.block {
    color: #a5cbff;
  }
  
  .token.tag .token.punctuation,
  .token.operator,
  .token.op,
  .token.module {
    color: #89DDFF;
  }

  .token.nil {
    color: #9b9fb0;
  }

  .token.arrow {
    color: #c49dff;
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
  .token.property {
    color: #82AAFF;
  }

  .token.method,
  .language-css .token.function {
    color: #25c8e5;
  }

  .token.variable {
    color: #ffad92;
  }

  .token.dom,
  .token.class-name {
    color: #ffc777;
  }

  .token.property.definition {
    color: #77e0c6;
  }

  .token.property.access {
    color: #89DDFF;
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
      font-weight: bold;
      padding: 8px 15px;
      font-family: ${MONOSPACE_FONT_STACK};
      color: white;
      margin-left: -5.55%;
      padding-left: 5%;
      text-transform: uppercase;
      font-size: 15px;
      text-align: right;
      pointer-events: none;

      ${MEDIA.sm} {
        width: calc(100% + 50px);
        margin-left: -25px;
        padding-left: 25px;
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
`
