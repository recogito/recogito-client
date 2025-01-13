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
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, 'text/html');
    return doc.body || document.createElement('body');
  }

  //Remove <script> elements
  function removeScripts(html: any) {
    let scripts = html.querySelectorAll('script');
    for (let script of scripts) {
      script.remove();
    }
  }

  //Check if the attribute is potentially dangerous
  function isPossiblyDangerous(name: string, value: string) {
    let val = value.replace(/\s+/g, '').toLowerCase();
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
    let atts = elem.attributes;
    for (let { name, value } of atts) {
      if (!isPossiblyDangerous(name, value)) continue;
      elem.removeAttribute(name);
    }
  }

  // Remove dangerous stuff from the HTML document's nodes
  function clean(html: any) {
    let nodes = html.children;
    for (let node of nodes) {
      removeAttributes(node);
      clean(node);
    }
  }

  // Convert the string to HTML
  let html = stringToHTML();

  // Sanitize it
  removeScripts(html);
  clean(html);

  return html.innerHTML;
};
