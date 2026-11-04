// CA Double tab icon: crossed surfboard + snowboard artwork. The board for the current mode is on top and lit;
// the other is faded. In CA Double both are lit. The three states cross-fade.
import React from 'react';
import surf from '../assets/boards-surf.webp';
import dbl from '../assets/boards-double.webp';
import snow from '../assets/boards-snow.webp';

const ART = { surf, double: dbl, snow };

/** mode: 'surf' | 'double' | 'snow' */
export default function BoardsX({ mode, size = 40 }) {
  return (
    <span aria-hidden="true" style={{ position: 'relative', display: 'block', width: size, height: size }}>
      {Object.entries(ART).map(([k, src]) => (
        <img key={k} src={src} alt="" width={size} height={size} draggable={false}
          style={{ position: 'absolute', inset: 0, width: size, height: size, opacity: k === mode ? 1 : 0, transition: 'opacity .25s' }} />
      ))}
    </span>
  );
}
