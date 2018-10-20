module.exports = prefixify = ({ filename, prefix = '' }) => {
  return {
    html: `${filename}-${prefix}.html`,
    pdf: `${filename}-${prefix}.pdf`
  }
}