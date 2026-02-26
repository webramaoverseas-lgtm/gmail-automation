/**
 * Simple Template Engine
 * Replaces {{name}} with the contact's name in HTML strings.
 */
function fillTemplate(html, data) {
  let result = html;
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, data[key]);
  }
  return result;
}

module.exports = { fillTemplate };
