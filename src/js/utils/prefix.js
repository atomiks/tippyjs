/**
 * Returns the supported prefixed property - only `webkit` is needed, `moz`, `ms` and `o` are obsolete
 * @param {String} property
 * @return {String} - browser supported prefixed property
 */
export default function prefix(property) {
  const prefixes = ['', 'webkit']
  const upperProp = property.charAt(0).toUpperCase() + property.slice(1)

  for (let i = 0; i < prefixes.length; i++) {
    const prefix = prefixes[i]
    const prefixedProp = prefix ? prefix + upperProp : property
    if (typeof document.body.style[prefixedProp] !== 'undefined') {
      return prefixedProp
    }
  }

  return null
}
