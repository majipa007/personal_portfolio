# Terminal in Space — Portfolio

Personal portfolio of **Sulav Kumar Shrestha**, AI Systems Engineer.

The whole site is a single `index.html`: a brutalist 3D command-line environment.
Concrete slabs float in a black void — one per section — rendered through a custom
fullscreen ASCII post-processing shader with phosphor-green terminal accents.
Scrolling flies the camera between slabs; nav clicks run `cd ~/experience`-style
commands in a persistent terminal strip that types each command with realistic
keystrokes as you navigate. A fake system HUD (uptime, load, mem) ticks in the
corner, and the boot preloader runs a real progress sequence before dropping you
into the void.

## Stack

- [Three.js](https://threejs.org) via CDN importmap — slabs, dust, and the
  hand-rolled ASCII/dither post pass (no build step)
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
`concepts/index.html` for a picker. The root site is the "Terminal in Space"
concept; the others (Inside the Model, Inference Pipeline, Latent Space,
Hybrid) remain as fully working single-file variants.

## Quality floor

- DPR capped at 1.75; an FPS probe drops the ASCII pass, then dust, on weak
  devices (`?fx=ascii|off` to force)
- `prefers-reduced-motion` disables the camera flight and pre-types the terminal
- No WebGL → a genuinely good pure-HTML terminal page (typing still live)
- Semantic HTML, keyboard-reachable interactive elements, visible focus styles
