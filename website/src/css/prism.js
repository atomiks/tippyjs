import { createGlobalStyle } from 'styled-components'
import { MEDIA } from '../components/Framework'

export default createGlobalStyle`
  code,
  pre {
    font-family: Menlo, Consolas, 'Liberation Mono', Courier, monospace;
    filter: saturate(1.15);
  }

  /* Firefox really hates this apparently */
  .Firefox {
    code, 
    pre {
      filter: none;
    }
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
    padding: 16px 15px;
    margin-top: 0;
    margin-left: -5.55%;
    margin-right: -5.55%;
    background: #28283d;
    font-size: 95%;
    line-height: 2;
    max-height: 650px;
    overflow: auto;

    [data-elastic-wrapper] {
      display: inline-block;
    }

    ${MEDIA.sm} {
      margin-left: -25px;
      margin-right: -25px;
    }

    ${MEDIA.md} {
      border-radius: 8px;
      margin-left: 0;
      margin-right: 0;
      padding: 16px 24px;
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
    color: #c49dff;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #8398cd;
  }

  .token.attr-name,
  .token.selector {
    color: #ffbb8e;
  }

  .token.boolean {
    color: #ff92d6;
  }

  .token.punctuation,
  .token.operator,
  .token.op,
  .token.module {
    color: #8fddff;
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
    color: #ff7e99;
  }

  .token.number,
  .token.symbol,
  .token.deleted {
    color: #ff9f57;
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
    color: #6fadff;
  }

  .token.method {
    color: #16c5ff;
  }

  .token.variable {
    color: #ffad92;
  }

  .token.dom,
  .token.class-name {
    color: #ffdb94;
  }

  .token.property.definition {
    color: #c3e9a9;
  }

  .token.property.access {
    color: #99c3e9;
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
