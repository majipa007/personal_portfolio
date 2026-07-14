# The Inference Pipeline — Portfolio

Personal portfolio of **Sulav Kumar Shrestha**, AI Systems Engineer.

The whole site is a single `index.html`: you follow a glowing request token
through real AI infrastructure. Scroll scrubs its journey — API gateway →
batching lanes → an isometric city of AKS microservice pods with Service-Bus
conveyors → GPU racks → output crates → a green `200 OK` exit. A persistent
instrument HUD ticks live p50/p99 latency, queue depth, batch size and tok/s,
all reacting to scroll velocity. Graphite and blueprint tones with a single
signal-orange accent.

## Stack

- [Three.js](https://threejs.org) via CDN importmap — instanced pods, racks,
  conveyors and the token (no build step)
- [GSAP](https://gsap.com) + ScrollTrigger for camera choreography and reveals
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- Everything lives in one HTML file — no dependencies to install

## Run

Serve the file over HTTP (module scripts + font loading behave best that way):

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Deployed on Vercel as a static site — no build configuration needed.

## Alternate concepts

Five competing art directions live under [`concepts/`](concepts/) — open
`concepts/index.html` for a picker. The root site is "The Inference Pipeline"
concept; the others (Inside the Model, Terminal in Space, Latent Space,
Hybrid) remain as fully working single-file variants.

## Quality floor

- DPR capped at 1.75; an FPS probe reduces resolution and particle counts on
  weak devices
- `prefers-reduced-motion` renders static per-section frames with native scroll
- No WebGL → a clean dark editorial fallback with all content visible
- Semantic HTML, keyboard-reachable interactive elements, visible focus styles
