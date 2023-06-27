import jsxToSvg from './jsxToSvg.js';
import svgToPng from './svgToPng.js';

export default async function jsxToPng(jsx: JSX.Element) {
  const svg = await jsxToSvg(jsx);
  const png = svgToPng(svg);

  return png;
}