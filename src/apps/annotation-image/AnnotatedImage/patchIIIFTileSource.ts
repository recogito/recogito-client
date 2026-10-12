import OpenSeadragon from 'openseadragon';

/**
 * OpenSeadragon 6 requests tiles from IIIF Image API 2 servers with an
 * exact "w,h" size. Some servers advertise level 2 support (which requires
 * "w,h") but reject this form with a 400 error.
 *
 * For these hosts only, this patch rewrites the size segment of v2 tile
 * URLs to the "w," form (what OpenSeadragon 5 used). Other servers keep
 * the "w,h" form, which avoids rounding errors in tile dimensions.
 *
 * Remove a host once its server is fixed, cf.
 * https://github.com/openseadragon/openseadragon/issues/2875
 */
const WIDTH_ONLY_HOSTS = new Set([
  'ids.si.edu' // Smithsonian IDS
]);

const proto = (OpenSeadragon as any).IIIFTileSource.prototype;

if (!proto.__widthOnlySize) {
  const getTileUrl = proto.getTileUrl;

  proto.getTileUrl = function (level: number, x: number, y: number) {
    const url: string = getTileUrl.call(this, level, x, y);
    if (this.version !== 2) return url;

    try {
      if (!WIDTH_ONLY_HOSTS.has(new URL(url).hostname)) return url;
    } catch {
      return url;
    }

    // {id}/{region}/{size}/{rotation}/{quality}.{format}
    const segments = url.split('/');
    const sizeIdx = segments.length - 3;

    const match = segments[sizeIdx].match(/^(\d+),\d+$/);
    if (match)
      segments[sizeIdx] = `${match[1]},`;

    return segments.join('/');
  };

  proto.__widthOnlySize = true;
}
