const COLOR_PROPS = {
  background: ["background-color"],
  fill: ["fill-color"],
  line: ["line-color"],
  circle: ["circle-color", "circle-stroke-color"],
  symbol: ["text-color", "text-halo-color", "icon-color"],
  "fill-extrusion": ["fill-extrusion-color"],
};

function desaturateColor(color) {
  const hex = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  const rgb = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!hex && !rgb) return color;

  const [r, g, b] = hex
    ? [1, 2, 3].map((i) => parseInt(hex[i], 16) / 255)
    : [1, 2, 3].map((i) => Number(rgb[i]) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  let h = 0;

  if (d) {
    h =
      max === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : max === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;
    h /= 6;
  }

  const saturation = s * 0.2;
  const q = l < 0.5 ? l * (1 + saturation) : l + saturation - l * saturation;
  const p = 2 * l - q;
  const hue = (t) => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  };

  return `rgb(${[hue(h + 1 / 3), hue(h), hue(h - 1 / 3)]
    .map((value) => Math.round(value * 255))
    .join(", ")})`;
}

export function softenBaseMap(map) {
  const layers = map.getStyle().layers ?? [];

  layers.forEach((layer) => {
    const id = layer.id.toLowerCase();
    const sourceLayer = (layer["source-layer"] ?? "").toLowerCase();
    if (/poi|transit|station|airport|rail/.test(`${id} ${sourceLayer}`)) {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }

    (COLOR_PROPS[layer.type] ?? []).forEach((prop) => {
      const value = map.getPaintProperty(layer.id, prop);
      if (typeof value === "string") {
        map.setPaintProperty(layer.id, prop, desaturateColor(value));
      }
    });
  });
}
