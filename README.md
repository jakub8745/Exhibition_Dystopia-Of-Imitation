# The Dystopia of an Imitation (WebGL Gallery)

Interactive 3D gallery built with Three.js. The scene loads a custom 3D environment and allows visitors to navigate the space, focus artworks, and open information panels.

## Features
- First-person style navigation with collision against walls and the pitcher
- Desktop + mobile controls (on-screen joystick for touch)
- Info panel (iframe) and audio toggle
- Movement help modal shown once per visitor
- WebGL renderer with tone mapping and shadows

## Controls
Desktop
- Move: WASD or Arrow keys
- Look/rotate: click + drag
- Zoom: mouse wheel
- Focus artwork: double click

Mobile / Tablet
- Move: on-screen joystick
- Look/rotate: one-finger drag
- Zoom/pan: two-finger gesture

## Run locally
```sh
npm install
npm run dev
```

## Build
```sh
npm run build
```

## Tech
- Three.js
- Tween.js
- Vite

## Notes
Best experience is on larger screens and modern browsers with hardware acceleration enabled.
