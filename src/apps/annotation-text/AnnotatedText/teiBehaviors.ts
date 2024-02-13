const copyAttr = (attr: string, from: Element, to: Element, defaultVal?: any) => {
  if (defaultVal) {
    const value = from.getAttribute(attr) || defaultVal;
    to.setAttribute(attr, value);
  } else { 
    if (from.hasAttribute(attr))
      to.setAttribute(attr, from.getAttribute(attr)!);
  }
}

export const behaviors = {

  graphic: (elem: Element) => {
    const content = new Image();
    content.src = elem.getAttribute('url')?.trim()!;

    copyAttr('width', elem, content);
    copyAttr('height', elem, content);
    copyAttr('rend', elem, content);
    copyAttr('rendition', elem, content);

    const desc = elem.getAttribute('desc') || '';
    content.setAttribute('alt', desc);

    elem.appendChild(content);
  }

}