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
  
  tei: {

    desc: (elem: Element) => {
      // @ts-ignore
      elem.hidden = true;
    },

    figure: (figure: Element) => {
      const graphic = Array.from(figure.children).find(child => child.getAttribute('data-origname') === 'graphic');

      if (graphic) {
        const img = new Image();
        const url = graphic.getAttribute('url');
        img.src = url ? url.trim() : '';

        copyAttr('width', graphic, img);
        copyAttr('height', graphic, img);

        copyAttr('rendition', figure, img);

        copyAttr('rend', figure, img);
        figure.removeAttribute('rend');

        const desc = figure.querySelector('[data-origname="desc"]');
        if (desc?.innerHTML)
          img.setAttribute('alt', desc.innerHTML);

        graphic.appendChild(img);
      }
    },

    graphic: (elem: Element) => {
      // Handle 'graphic' element only in case it wasn't aready 
      // handled as a child of a figure already.
      if (elem.parentElement?.getAttribute('data-origname') !== 'figure') {
        const img = new Image();
        const url = elem.getAttribute('url');
        img.src = url ? url.trim() : '';

        copyAttr('width', elem, img);
        copyAttr('height', elem, img);

        elem.appendChild(img);
      }
    }

  }

}