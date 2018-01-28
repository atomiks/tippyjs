export default {
  input: './build/main.js',
  output: {
    file: './docs/tippy/tippy.js',
    format: 'umd',
    name: 'tippy',
    globals: { 'popper.js': 'Popper' }
  }
}
