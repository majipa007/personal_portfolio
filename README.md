# Inside the Model — Portfolio

Personal portfolio of **Sulav Kumar Shrestha**, AI Systems Engineer.

The whole site is a single `index.html`: one continuous WebGL scene that flies a
camera through the interior of a stylized neural network. Scrolling moves the
camera along a choreographed path; each section is a station inside the model.
A single GPU particle system (~200k points on desktop, ~40k on mobile) morphs
between six precomputed states — hero typography, embedding cloud, activated
neurons, attention-head constellations, project output heads, and a final
converge-and-burst contact token. The particles never disappear; they reorganize.

## Stack

- [Three.js](https://threejs.org) via CDN importmap — custom GLSL vertex/fragment
  shaders for the particle morph system (no particle libraries)
- [GSAP](https://gsap.com) + ScrollTrigger for camera choreography and reveals
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- No build step, no dependencies to install — everything lives in `index.html`

## Run

Serve the file over HTTP (module scripts + font loading behave best that way):

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Any static host (GitHub Pages, Netlify, Vercel) can deploy it as-is.

## Quality floor

- All particle animation runs in the vertex shader; the CPU only updates uniforms
- Device pixel ratio capped at 1.75; an FPS probe halves the particle count and
  disables postprocessing on weak devices
- `prefers-reduced-motion` renders static per-section states with instant reveals
- No WebGL → the canvas hides and the content stands alone as a dark editorial page
- Semantic HTML, keyboard-reachable interactive elements, visible focus styles
