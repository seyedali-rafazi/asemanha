// Generate valid SVG string for a classic map pin marker
const generateMarkerSvg = (m) => {
  const size = m.size;
  const opacity = m.opacity / 100;
  let iconSvg = "";

  // Icons are shifted up slightly (Y-axis) to fit inside the top round part of the pin
  if (m.iconType === "star") {
    iconSvg = `<polygon points="50,15 61,35 82,35 65,48 72,68 50,55 28,68 35,48 18,35 39,35" fill="${m.iconColor}" />`;
  } else if (m.iconType === "circle") {
    iconSvg = `<circle cx="50" cy="40" r="18" fill="${m.iconColor}" />`;
  } else if (m.iconType === "square") {
    iconSvg = `<rect x="32" y="22" width="36" height="36" fill="${m.iconColor}" />`;
  }

  // Path draws a teardrop/map pin shape
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5 C27.9 5 10 22.9 10 45 C10 75 50 95 50 95 C50 95 90 75 90 45 C90 22.9 72.1 5 50 5 Z" 
          fill="${m.markerColor}" opacity="${opacity}" stroke="#ffffff" stroke-width="4"/>
    ${iconSvg}
  </svg>`;
};

export default generateMarkerSvg;
