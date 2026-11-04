// Fine-line crossed surfboard + snowboard mark (viewBox 0 0 100 100), heritage / outdoor-lettering style.
const SURF = 'M39,0 C27,-8 -6,-12.4 -28,-8.8 C-35.8,-7.4 -39,-3.6 -39,0 C-39,3.6 -35.8,7.4 -28,8.8 C-6,12.4 27,8 39,0 Z';
const SNOW = 'M-27,-8.2 C-12,-6.4 12,-6.4 27,-8.2 A8.2,8.2 0 0 1 27,8.2 C12,6.4 -12,6.4 -27,8.2 A8.2,8.2 0 0 1 -27,-8.2 Z';
function mark({ surf, snow, sw = 2.2, id = 'm' }) {
  return `
  <defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140">
    <rect x="-20" y="-20" width="140" height="140" fill="#fff"/>
    <path d="${SURF}" transform="translate(50 50) rotate(-45)" fill="#000" stroke="#000" stroke-width="${sw * 3.2}"/>
  </mask></defs>
  <g mask="url(#${id})" fill="none" stroke="${snow}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(50 50) rotate(45)">
      <path d="${SNOW}"/>
      <path d="M-15,-3.6 L-15,3.6 M-11,-3.6 L-11,3.6 M11,-3.6 L11,3.6 M15,-3.6 L15,3.6" stroke-width="${sw * 0.8}"/>
    </g>
  </g>
  <g fill="none" stroke="${surf}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" transform="translate(50 50) rotate(-45)">
    <path d="${SURF}"/>
    <path d="M-35,0 L33,0" stroke-width="${sw * 0.6}"/>
    <path d="M-30.5,-5.2 L-35,-10 L-28.5,-8.2" stroke-width="${sw * 0.8}"/>
    <path d="M-30.5,5.2 L-35,10 L-28.5,8.2" stroke-width="${sw * 0.8}"/>
  </g>`;
}
module.exports = { mark };
