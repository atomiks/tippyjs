import Image from 'next/image';
import logo from '../assets/logo.svg';
import orbs from '../assets/orbs.svg';
import Highlight, {defaultProps} from 'prism-react-renderer';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const theme = {
  styles: [
    {
      types: ['comment', 'block-comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#495495',
        fontStyle: 'italic',
      },
    },
    {
      types: ['punctuation'],
      style: {
        color: '#87e1fc',
      },
    },
    {
      types: ['tag', 'namespace', 'number', 'unit', 'hexcode', 'deleted'],
      style: {
        color: '#e2777a',
      },
    },
    {
      types: ['property', 'selector'],
      style: {
        color: '#72f1b8',
        textShadow: '0 0 2px #100c0f, 0 0 10px #257c5575, 0 0 35px #21272475',
      },
    },
    {
      types: ['function-name'],
      style: {
        color: '#6196cc',
      },
    },
    {
      types: ['boolean', 'selector-id', 'function'],
      style: {
        color: '#85a9ff',
      },
    },
    {
      types: ['class-name', 'maybe-class-name', 'builtin'],
      style: {
        color: '#fff5f6',
        textShadow:
          '0 0 2px #000, 0 0 10px #fc1f2c75, 0 0 5px #fc1f2c75, 0 0 25px #fc1f2c75',
      },
    },
    {
      types: ['constant', 'symbol'],
      style: {
        color: '#f92aad',
        textShadow: '0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3',
      },
    },
    {
      types: ['important', 'atrule', 'keyword', 'attr-name', 'selector-class'],
      style: {
        color: '#c096ff',
      },
    },
    {
      types: ['string', 'char', 'attr-value', 'regex', 'variable'],
      style: {
        color: '#cff894',
      },
    },
    {
      types: ['parameter'],
      style: {
        fontStyle: 'italic',
      },
    },
    {
      types: ['entity', 'url'],
      style: {
        color: '#67cdcc',
      },
    },
    {
      types: ['operator'],
      style: {
        color: 'ffffffee',
      },
    },
    {
      types: ['important', 'bold'],
      style: {
        fontWeight: 'bold',
      },
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic',
      },
    },
    {
      types: ['entity'],
      style: {
        cursor: 'help',
      },
    },
    {
      types: ['inserted'],
      style: {
        color: 'green',
      },
    },
  ],
};

const tooltipHtmlCode = `
<button data-tippy-content="Add emoji">🙂</button>
`.trim();

const tooltipJsCode = `
tippy('[data-tippy-content]');
`.trim();

function HomePage() {
  return (
    <>
      <img
        className="absolute t-0 -z-1"
        src="https://atomiks.github.io/tippyjs/static/bubbles-4989859a4b6961599ff97c983f6f5947.svg"
      />
      <header className="from-gray-700 to-gray-800 mb-24">
        <div className="container py-8 mx-auto px-4 text-center max-w-screen-xl">
          <Image src={logo} height={150} />
          <div className="absolute -z-1 top-0">
            <Image src={orbs} height={800} />
          </div>
          <h1 className="text-gray-50 mb-8 text-6xl font-bold">
            Floating elements for the web.
          </h1>
          <div className="flex flex-row justify-center gap-x-4">
            <button className="bg-blue-600 rounded text-gray-50 px-4 py-3 text-xl font-bold">
              Get Started
            </button>
            <button className="bg-gray-50 rounded text-gray-900 px-4 py-3 text-xl font-bold">
              GitHub
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="container mx-auto px-4 max-w-screen-xl">
          <h2 className="inline-block text-5xl font-bold leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Simple yet powerful.
          </h2>
          <p className="text-3xl text-left">
            One function can build all types of floating elements. Tooltips,
            popovers, dropdowns, modals, menus, and more.
          </p>
        </div>
        <div className="container px-4 py-8 mx-auto max-w-screen-xl">
          <div className="grid lg:grid-cols-2 gap-8 bg-gradient-to-r from-blue-800 to-purple-800 rounded-lg p-12">
            <div>
              <h3 className="text-3xl text-gray-50 font-bold mb-4">
                Instant tooltips
              </h3>
              <p className="text-2xl mb-4">
                Add beautiful, accessible tooltips that just work™ across all
                devices using one line of HTML and JavaScript.
              </p>
              <p className="text-2xl">
                Customize the styling, animation, and behavior of the tooltip in
                a few lines of code.
              </p>
              <button className="text-green-300 text-2xl mt-4 font-bold">
                Get started
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Highlight
                {...defaultProps}
                code={tooltipHtmlCode}
                theme={theme}
                language="html"
              >
                {({className, style, tokens, getLineProps, getTokenProps}) => (
                  <pre
                    className="bg-gray-800 p-4 rounded-lg overflow-x-auto"
                    style={style}
                  >
                    {tokens.map((line, i) => (
                      <div {...getLineProps({line, key: i})}>
                        {line.map((token, key) => (
                          <span {...getTokenProps({token, key})} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
              <Highlight
                {...defaultProps}
                code={tooltipJsCode}
                language="js"
                theme={theme}
              >
                {({className, style, tokens, getLineProps, getTokenProps}) => (
                  <pre
                    className="bg-gray-800 p-4 rounded-lg overflow-x-auto"
                    style={style}
                  >
                    {tokens.map((line, i) => (
                      <div {...getLineProps({line, key: i})}>
                        {line.map((token, key) => (
                          <span {...getTokenProps({token, key})} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
              <div className="flex justify-center align-center bg-gray-300 py-12 text-gray-900 rounded-lg">
                <div className="text-center">
                  <Tippy content="Add emoji" offset={[0, 8]}>
                    <button className="text-3xl">🙂</button>
                  </Tippy>
                  <div className="text-gray-500">Hover, tap, or focus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default HomePage;
