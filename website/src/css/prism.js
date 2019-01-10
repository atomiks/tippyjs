import { createGlobalStyle } from 'styled-components'
import { MEDIA } from '../components/Framework'

export default createGlobalStyle`
  code,
  pre {
    font-family: Menlo, Consolas, 'Liberation Mono', Courier, monospace;
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
    line-height: 2.25;
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
    font-size: 15px;
    line-height: 2;
    max-height: 650px;
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
      border-radius: 8px;
      margin-left: 0;
      margin-right: 0;
      padding: 16px 24px;
      font-size: 16px;
    }
  }

  code.language-text {
    background: linear-gradient(90deg, #f3edff, #edf5ff);
    color: #2569d7;
    font-weight: bold;
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 85%;
    line-height: inherit;
  }

  .token.important,
  .token.atrule,
  .token.keyword {
    color: #bc90ff;
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
    color: #ff81d0;
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
    color: #e99eff;
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
    color: #ff6c8b;
  }

  .token.number,
  .token.symbol,
  .token.deleted {
    color: #ff984b;
  }

  .token.string,
  .language-css .token.string,
  .token.url,
  .token.attr-value,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #4ef2d0;
  }

  .token.entity,
  .style .token.string {
    color: #ecd6ba;
    text-shadow: 0 1px 3px transparentize(#ecd6ba, 0.5);
  }

  .token.function,
  .token.property {
    color: #61a5ff;
  }

  .token.method {
    color: #16c5ff;
  }

  .token.variable {
    color: #ffad92;
  }

  .token.dom,
  .token.class-name {
    color: #ffd278;
  }

  .token.property.definition {
    color: #b6e992;
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
`
