export const truncateString = (str: string, maxLength: number) => {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  } else {
    return str;
  }
};

// Adapted from https://gomakethings.com/how-to-sanitize-html-strings-with-vanilla-js-to-reduce-your-risk-of-xss-attacks/

export const cleanHTML = (str: string) => {
  //Convert the string to an HTML document
  function stringToHTML() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'text/html');
    return doc.body || document.createElement('body');
  }

  //Remove <script> elements
  function removeScripts(html: any) {
    const scripts = html.querySelectorAll('script');
    for (const script of scripts) {
      script.remove();
    }
  }

  //Check if the attribute is potentially dangerous
  function isPossiblyDangerous(name: string, value: string) {
    const val = value.replace(/\s+/g, '').toLowerCase();
    if (['src', 'href', 'xlink:href'].includes(name)) {
      if (val.includes('javascript:') || val.includes('data:text/html'))
        return true;
    }
    if (name.startsWith('on')) return true;
  }

  //Remove potentially dangerous attributes from an element
  function removeAttributes(elem: any) {
    // Loop through each attribute
    // If it's dangerous, remove it
    const atts = elem.attributes;
    for (const { name, value } of atts) {
      if (!isPossiblyDangerous(name, value)) continue;
      elem.removeAttribute(name);
    }
  }

  // Remove dangerous stuff from the HTML document's nodes
  function clean(html: any) {
    const nodes = html.children;
    for (const node of nodes) {
      removeAttributes(node);
      clean(node);
    }
  }

  // Convert the string to HTML
  const html = stringToHTML();

  // Sanitize it
  removeScripts(html);
  clean(html);

  return html.innerHTML;
};
