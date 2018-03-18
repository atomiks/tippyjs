module.exports = {
  escapeHTML(str) {
    return str
      .replace(
        /[&<>'"]/g,
        tag =>
          ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
          }[tag] || tag)
      )
      .trim()
  }
}
