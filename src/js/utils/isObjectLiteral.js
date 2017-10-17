export default function isObjectLiteral(input) {
  return !!input && input.toString() === '[object Object]'
}
