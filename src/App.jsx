import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { fetchPortfolioRepos } from './lib/github'
import { getSkillFallbackLabel, getSkillIcon } from './lib/skillIcons'

const navItems = [
  { label: 'about', href: '#about' },
  { label: 'experience', href: '#experience' },
  { label: 'skills', href: '#skills' },
  { label: 'projects', href: '#projects' },
  { label: 'blog', href: '#blog' },
  { label: 'contact', href: '#contact' },
]

const currentlyItems = [
  'Shipping LLM workflows on Azure',
  'Optimizing inference for edge and cloud',
  'Designing scalable microservice AI systems',
]

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/majipa007' },
  { label: 'Medium', href: 'https://medium.com/@sulavstha007' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/sulav-shrestha-16b1091bb' },
  { label: 'Kaggle', href: 'https://kaggle.com/sulavshrestha007' },
  { label: 'LeetCode', href: 'https://leetcode.com' },
  { label: 'HackerRank', href: 'https://hackerrank.com' },
]

const experienceItems = [
  {
    company: 'InCorp',
    role: 'AI & Data Engineer Intern',
    period: 'Apr 2025 – Present (Onsite)',
    points: [
      'Built intelligent PDF-to-Excel extraction pipelines using Azure Document Intelligence + Azure OpenAI. Cut processing time from 1–2 hours to under 5 minutes.',
      'Designed large-scale document compliance system across 6 microservices/AKS pods with Azure Service Bus, handling hundreds of thousands of documents with classification, verification, and validation.',
      'Developed transaction risk workflows flagging duplicates, anomalies, and compliance violations with automated reporting.',
      'Stack: FastAPI, CosmosDB, Redis, MS Graph API, SharePoint, Azure OpenAI, Azure Document Intelligence, AKS, HMAC-secured endpoints.',
    ],
  },
  {
    company: 'Sprhava (Germany, Remote)',
    role: 'Jr. Data Scientist',
    period: 'Jul 2024 – Nov 2024',
    points: [
      'Enhanced YOLOv8 obstacle tracking system; reduced false positives.',
      'Replaced DeepSORT with ByteTrack — boosted FPS by 30% in dynamic envs.',
      'Optimized system for cloud deployment.',
      'Stack: YOLOv8, ByteTrack, Python, OpenCV, Git.',
    ],
  },
]

const skills = {
  Languages: ['Python', 'Java', 'JavaScript', 'SQL'],
  'AI/ML': [
    'PyTorch',
    'TensorFlow/Keras',
    'Scikit-learn',
    'YOLOv8',
    'OpenCV',
    'MediaPipe',
    'ONNX Runtime',
    'NumPy',
    'Pandas',
  ],
  'LLM/NLP': ['LangChain', 'Hugging Face Transformers', 'Azure OpenAI', 'Prompt Engineering'],
  Infrastructure: [
    'Docker',
    'AKS/Kubernetes',
    'FastAPI',
    'PostgreSQL',
    'CosmosDB',
    'Redis',
    'Apache Airflow',
    'dbt',
    'Azure Service Bus',
  ],
}

const contactLinks = [
  { label: 'Email', value: 'sulavstha007@gmail.com', href: 'mailto:sulavstha007@gmail.com' },
  { label: 'GitHub', value: 'github.com/majipa007', href: 'https://github.com/majipa007' },
  {
    label: 'LinkedIn',
    value: 'sulav-shrestha-16b1091bb',
    href: 'https://linkedin.com/in/sulav-shrestha-16b1091bb',
  },
  { label: 'Phone', value: '+91 8921875723', href: 'tel:+918921875723' },
]

function NeuralBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 0, 7)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const root = new THREE.Group()
    scene.add(root)

    const ambient = new THREE.AmbientLight(0x2a2a2a, 0.45)
    const point = new THREE.PointLight(0x333333, 0.65)
    point.position.set(2, 3, 4)
    scene.add(ambient, point)

    const layerX = [-3.4, -1.8, 0, 1.8, 3.4]
    const layerCounts = [12, 18, 20, 18, 12]
    const layerNodes = []
    const nodeMaterial = new THREE.MeshStandardMaterial({ color: '#1e1e1e', emissive: '#333333', roughness: 0.9 })

    layerX.forEach((x, layerIndex) => {
      const nodes = []
      const count = layerCounts[layerIndex]
      for (let i = 0; i < count; i += 1) {
        const y = ((i / (count - 1 || 1)) * 3.8 - 1.9) + (Math.random() - 0.5) * 0.45
        const z = (Math.random() - 0.5) * 2.6
        const radius = 0.06 + Math.random() * 0.06
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16), nodeMaterial)
        mesh.position.set(x + (Math.random() - 0.5) * 0.25, y, z)
        nodes.push(mesh)
        root.add(mesh)
      }
      layerNodes.push(nodes)
    })

    const edges = []
    const lineMaterial = new THREE.LineBasicMaterial({ color: '#1a1a1a', transparent: true, opacity: 0.7 })

    for (let i = 0; i < layerNodes.length - 1; i += 1) {
      const sourceLayer = layerNodes[i]
      const targetLayer = layerNodes[i + 1]
      sourceLayer.forEach((node) => {
        const sampled = [...targetLayer].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3))
        sampled.forEach((targetNode) => {
          const points = [node.position.clone(), targetNode.position.clone()]
          const geometry = new THREE.BufferGeometry().setFromPoints(points)
          const line = new THREE.Line(geometry, lineMaterial)
          root.add(line)
          edges.push({ from: node.position.clone(), to: targetNode.position.clone() })
        })
      })
    }

    const pulseMaterial = new THREE.MeshBasicMaterial({ color: '#888888', transparent: true, opacity: 0 })
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), pulseMaterial)
    root.add(pulse)

    let currentPulse = null
    const triggerPulse = () => {
      const edge = edges[Math.floor(Math.random() * edges.length)]
      if (!edge) return
      if (currentPulse) currentPulse.kill()

      const state = { t: 0 }
      pulse.visible = true
      currentPulse = gsap.timeline()
      currentPulse
        .to(pulseMaterial, { opacity: 1, duration: 0.15, ease: 'power1.out' })
        .to(
          state,
          {
            t: 1,
            duration: 1,
            ease: 'none',
            onUpdate: () => {
              pulse.position.lerpVectors(edge.from, edge.to, state.t)
            },
          },
          0,
        )
        .to(pulseMaterial, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 0.85)
    }

    triggerPulse()
    const pulseInterval = window.setInterval(triggerPulse, 1500)

    const mouse = { x: 0, y: 0 }
    const targetCamera = new THREE.Vector3(0, 0, 7)

    const onPointerMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = (event.clientY / window.innerHeight) * 2 - 1
    }

    const getBaseOffsetX = () => {
      if (window.innerWidth >= 1600) return 2.55
      if (window.innerWidth >= 1280) return 2.3
      if (window.innerWidth >= 1024) return 2.05
      if (window.innerWidth >= 760) return 1.45
      return 0.85
    }

    let baseOffsetX = getBaseOffsetX()
    let drift = 0
    let driftDirection = 1
    const clock = new THREE.Clock()
    let raf = 0

    const tick = () => {
      const delta = clock.getDelta()
      root.rotation.y += 0.0003 * (delta * 60)
      drift += 0.00008 * driftDirection * (delta * 60)
      if (Math.abs(drift) > 0.34) {
        driftDirection *= -1
      }
      root.position.x = baseOffsetX + drift

      targetCamera.x = mouse.x * 0.36
      targetCamera.y = -mouse.y * 0.25
      camera.position.x += (targetCamera.x - camera.position.x) * 0.04
      camera.position.y += (targetCamera.y - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
      raf = window.requestAnimationFrame(tick)
    }

    const onResize = () => {
      baseOffsetX = getBaseOffsetX()
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove)
    tick()

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.clearInterval(pulseInterval)
      window.cancelAnimationFrame(raf)
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose())
          } else {
            obj.material.dispose()
          }
        }
      })
    }
  }, [])

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />
}

function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let active = false
    let hovering = false

    const onMove = (event) => {
      active = true
      mouseX = event.clientX
      mouseY = event.clientY
      dot.style.opacity = '1'
      ring.style.opacity = '1'
    }

    const setHover = (state) => {
      hovering = state
    }

    const hoverables = document.querySelectorAll('a, button, [data-hoverable="true"]')
    const hoverHandlers = []
    hoverables.forEach((el) => {
      const onEnter = () => setHover(true)
      const onLeave = () => setHover(false)
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
      hoverHandlers.push({ el, onEnter, onLeave })
    })

    let raf = 0
    const animate = () => {
      if (active) {
        dot.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`
        ringX += (mouseX - ringX) * 0.12
        ringY += (mouseY - ringY) * 0.12
        const size = hovering ? 52 : 36
        ring.style.width = `${size}px`
        ring.style.height = `${size}px`
        ring.style.transform = `translate3d(${ringX - size / 2}px, ${ringY - size / 2}px, 0)`
      }
      raf = window.requestAnimationFrame(animate)
    }

    window.addEventListener('pointermove', onMove)
    animate()

    return () => {
      window.removeEventListener('pointermove', onMove)
      hoverHandlers.forEach(({ el, onEnter, onLeave }) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
      window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}

function ConceptCanvas({ variant }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100)
    camera.position.set(0, 1.5, 6.5)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const group = new THREE.Group()
    scene.add(group)

    const ambient = new THREE.AmbientLight(0x2f2f2f, 0.8)
    const rim = new THREE.PointLight(0x5a5a5a, 0.5)
    rim.position.set(4, 4, 4)
    scene.add(ambient, rim)

    const updaters = []

    if (variant === 1) {
      const slabMat = new THREE.MeshStandardMaterial({ color: '#151515', roughness: 0.8, metalness: 0.15 })
      const slabs = [-1.5, 0.1, 1.7].map((x) => {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 2.1), slabMat)
        slab.position.set(x, 0.8, 0)
        slab.scale.set(1, 1, 0.45)
        group.add(slab)
        return slab
      })

      slabs.forEach((slab) => {
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(slab.geometry),
          new THREE.LineBasicMaterial({ color: '#333333', transparent: true, opacity: 0.9 }),
        )
        edges.position.copy(slab.position)
        edges.scale.copy(slab.scale)
        group.add(edges)
      })

      const lane = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-3.4, 0.8, 0),
          new THREE.Vector3(3.2, 0.8, 0),
        ]),
        new THREE.LineBasicMaterial({ color: '#212121' }),
      )
      group.add(lane)

      const tokenMat = new THREE.MeshBasicMaterial({ color: '#8e8e8e' })
      const tokens = Array.from({ length: 18 }, (_, i) => {
        const token = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), tokenMat)
        token.position.set(-3.5 - i * 0.28, 0.8 + (Math.random() - 0.5) * 0.45, (Math.random() - 0.5) * 0.55)
        group.add(token)
        return token
      })

      const burst = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 10, 10),
        new THREE.MeshBasicMaterial({ color: '#9a9a9a', transparent: true, opacity: 0 }),
      )
      burst.position.set(2.6, 0.8, 0)
      group.add(burst)

      updaters.push((t) => {
        tokens.forEach((token, idx) => {
          const speed = 0.52 + (idx % 4) * 0.04
          const x = ((t * speed + idx * 0.32) % 7.2) - 3.6
          token.position.x = x
          token.position.y = 0.8 + Math.sin(t * 2 + idx) * 0.16
          token.material.opacity = 0.45 + Math.max(0, (x + 1.8) / 3.8) * 0.55
        })

        const pulse = (Math.sin(t * 1.9) + 1) / 2
        burst.material.opacity = pulse > 0.86 ? (pulse - 0.86) * 7 : 0
        burst.scale.setScalar(1 + pulse * 1.5)
      })
    }

    if (variant === 2) {
      const bars = []
      const geo = new THREE.BoxGeometry(0.22, 1, 0.22)
      for (let x = -2.6; x <= 2.6; x += 0.33) {
        for (let z = -1.8; z <= 1.8; z += 0.33) {
          const mat = new THREE.MeshStandardMaterial({ color: '#171717', emissive: '#222222', roughness: 0.85 })
          const bar = new THREE.Mesh(geo, mat)
          bar.position.set(x, 0.2, z)
          const seed = Math.random() * 10
          const amp = 0.35 + Math.random() * 1.1
          group.add(bar)
          bars.push({ bar, seed, amp })
        }
      }

      const grid = new THREE.GridHelper(6, 22, '#222222', '#141414')
      grid.position.y = -0.34
      group.add(grid)

      updaters.push((t) => {
        bars.forEach((entry, i) => {
          const spike = Math.max(0, Math.sin(t * 1.4 + entry.seed + i * 0.02))
          const h = 0.2 + Math.abs(Math.sin(t * 0.55 + entry.seed)) * entry.amp + spike * 0.75
          entry.bar.scale.y = h
          entry.bar.position.y = h * 0.5 - 0.25
          const dim = Math.min(0.26 + h * 0.11, 0.55)
          entry.bar.material.emissive.setScalar(dim)
        })
      })

      group.rotation.x = -0.22
      group.rotation.y = 0.45
      camera.position.set(0.1, 2.4, 6.3)
    }

    if (variant === 3) {
      const shells = [
        { scale: 1.65, color: '#252525' },
        { scale: 1.25, color: '#2f2f2f' },
        { scale: 0.85, color: '#3a3a3a' },
      ]

      shells.forEach((shell, index) => {
        const mesh = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(1.4, 1.4, 1.4)),
          new THREE.LineBasicMaterial({ color: shell.color, transparent: true, opacity: 0.95 - index * 0.2 }),
        )
        mesh.scale.setScalar(shell.scale)
        group.add(mesh)
      })

      const points = new THREE.Group()
      for (let i = 0; i < 80; i += 1) {
        const p = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 8, 8),
          new THREE.MeshBasicMaterial({ color: i % 7 === 0 ? '#8f8f8f' : '#4a4a4a' }),
        )
        p.position.set((Math.random() - 0.5) * 2.1, (Math.random() - 0.5) * 2.1, (Math.random() - 0.5) * 2.1)
        points.add(p)
      }
      group.add(points)

      updaters.push((t) => {
        group.rotation.y = t * 0.33
        group.rotation.x = Math.sin(t * 0.32) * 0.2
        const wave = (Math.sin(t * 1.1) + 1) / 2
        const qScale = 1.55 - wave * 0.52
        group.scale.set(qScale, 1.55 - wave * 0.34, qScale)
        points.children.forEach((node, idx) => {
          node.position.multiplyScalar(0.999 + Math.sin(t + idx * 0.18) * 0.0007)
        })
      })

      camera.position.set(0, 0.8, 6.2)
    }

    let raf = 0
    const clock = new THREE.Clock()

    const onResize = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(canvas)
    onResize()

    const tick = () => {
      const elapsed = clock.getElapsedTime()
      updaters.forEach((fn) => fn(elapsed))
      renderer.render(scene, camera)
      raf = window.requestAnimationFrame(tick)
    }

    tick()

    return () => {
      window.cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
    }
  }, [variant])

  return <canvas ref={canvasRef} className="concept-canvas" aria-hidden="true" />
}

function App() {
  const [repos, setRepos] = useState([])
  const [repoSource, setRepoSource] = useState('api')
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [navSolid, setNavSolid] = useState(false)

  const revealTargets = useMemo(
    () => [
      '#concepts .reveal',
      '#about .reveal',
      '#experience .reveal',
      '#skills .reveal',
      '#projects .reveal',
      '#blog .reveal',
      '#contact .reveal',
    ],
    [],
  )

  useEffect(() => {
    let mounted = true
    const loadRepos = async () => {
      setLoadingRepos(true)
      const result = await fetchPortfolioRepos()
      if (!mounted) return
      setRepos(result.repos)
      setRepoSource(result.source)
      setLoadingRepos(false)
    }
    loadRepos()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } })
    timeline
      .fromTo('.hero-label', { y: 24, opacity: 0 }, { y: 0, opacity: 1 })
      .fromTo('.hero-name', { y: 24, opacity: 0 }, { y: 0, opacity: 1 }, '+=0.15')
      .fromTo('.hero-tagline', { y: 24, opacity: 0 }, { y: 0, opacity: 1 }, '+=0.15')
      .fromTo('.hero-actions .btn', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15 }, '+=0.15')

    return () => {
      timeline.kill()
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const delay = Number(entry.target.getAttribute('data-delay') || 0)
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.7,
            delay,
            ease: 'power2.out',
          })
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.2 },
    )

    revealTargets.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        const isLeftReveal = element.classList.contains('left-reveal')
        gsap.set(element, { opacity: 0, y: isLeftReveal ? 0 : 24, x: isLeftReveal ? -24 : 0 })
        observer.observe(element)
      })
    })

    return () => observer.disconnect()
  }, [revealTargets])

  useEffect(() => {
    const onScroll = () => {
      setNavSolid(window.scrollY > 60)
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    const navLinks = document.querySelectorAll('.nav-link')

    const handlers = []
    navLinks.forEach((el) => {
      const original = el.dataset.text || ''
      const onEnter = () => {
        let iteration = 0
        const interval = window.setInterval(() => {
          const scrambled = original
            .split('')
            .map((char, index) => {
              if (index < iteration) return original[index]
              if (char === ' ') return ' '
              return letters[Math.floor(Math.random() * letters.length)]
            })
            .join('')

          el.textContent = scrambled
          iteration += 0.6
          if (iteration >= original.length) {
            window.clearInterval(interval)
            el.textContent = original
          }
        }, 40)
      }

      el.addEventListener('mouseenter', onEnter)
      handlers.push({ el, onEnter })
    })

    return () => {
      handlers.forEach(({ el, onEnter }) => el.removeEventListener('mouseenter', onEnter))
    }
  }, [])

  return (
    <>
      <CustomCursor />
      <header className={`site-nav ${navSolid ? 'solid' : ''}`}>
        <a className="brand mono" href="#top">
          sks
        </a>
        <nav>
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="nav-link mono" data-text={item.label}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main id="top">
        <section className="hero" id="hero">
          <NeuralBackground />
          <div className="hero-vignette" aria-hidden="true" />
          <div className="hero-content">
            <p className="hero-label mono">AI SYSTEMS ENGINEER</p>
            <h1 className="hero-name">Sulav Kumar Shrestha</h1>
            <p className="hero-tagline">
              Building intelligent systems at the intersection of LLMs, inference optimization & cloud
              infrastructure.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn btn-outline">
                view work
              </a>
              <a href="#contact" className="btn btn-solid">
                get in touch
              </a>
            </div>
          </div>
          <div className="scroll-hint mono">
            <span className="line" />
            scroll
          </div>
        </section>

        <section id="concepts" className="section concepts">
          <div className="section-head reveal">
            <span className="section-label mono">00</span>
            <h2>3D Hero Concepts (1, 2, 3)</h2>
          </div>
          <p className="concept-intro reveal" data-delay="0.04">
            Quick side-by-side prototypes. Pick one and I&apos;ll polish it into the final hero.
          </p>

          <div className="concept-grid">
            <article className="concept-card reveal" data-delay="0.06">
              <header>
                <span className="mono">1</span>
                <h3>Token → Transformer Pipeline</h3>
              </header>
              <ConceptCanvas variant={1} />
            </article>

            <article className="concept-card reveal" data-delay="0.1">
              <header>
                <span className="mono">2</span>
                <h3>Latency / Throughput City</h3>
              </header>
              <ConceptCanvas variant={2} />
            </article>

            <article className="concept-card reveal" data-delay="0.14">
              <header>
                <span className="mono">3</span>
                <h3>Quantization Lattice</h3>
              </header>
              <ConceptCanvas variant={3} />
            </article>
          </div>
        </section>

        <section id="about" className="section">
          <div className="section-head reveal">
            <span className="section-label mono">01</span>
            <h2>About</h2>
          </div>
          <div className="about-grid">
            <div className="about-copy reveal" data-delay="0.05">
              <p>
                I&apos;m an AI & Data Science student at KPRIET, Coimbatore (CGPA 9.0/10) with production
                experience shipping AI systems — from document compliance pipelines processing hundreds of
                thousands of records, to real-time object detection at the edge. My focus is on LLM systems,
                inference optimization, and AI infrastructure. I like building things that run fast and scale,
                not just things that work.
              </p>
            </div>
            <aside className="about-side reveal" data-delay="0.1">
              <h3 className="mono">Currently</h3>
              <ul>
                {currentlyItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="social-links">
                {socialLinks.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                    <span className="mono">{link.label}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="section-head reveal">
            <span className="section-label mono">02</span>
            <h2>Experience</h2>
          </div>
          <div className="timeline">
            {experienceItems.map((item, idx) => (
              <article className="timeline-item reveal left-reveal" data-delay={idx * 0.08} key={item.company}>
                <header>
                  <h3>{item.company}</h3>
                  <p className="mono">{item.role}</p>
                  <span className="mono period">{item.period}</span>
                </header>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="section">
          <div className="section-head reveal">
            <span className="section-label mono">03</span>
            <h2>Skills & Stack</h2>
          </div>
          <div className="skills-grid reveal" data-delay="0.05">
            {Object.entries(skills).map(([group, items]) => (
              <div key={group} className="skill-col">
                <h3 className="mono">{group}</h3>
                <ul>
                  {items.map((item, idx) => {
                    const icon = getSkillIcon(item)
                    const fallback = getSkillFallbackLabel(item)

                    return (
                      <li key={item} data-delay={idx * 0.02}>
                        <span className="skill-logo" aria-hidden="true">
                          {icon ? (
                            <svg viewBox="0 0 24 24">
                              <path d={icon.path} />
                            </svg>
                          ) : (
                            <span className="skill-fallback mono">{fallback}</span>
                          )}
                        </span>
                        <span>{item}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="section">
          <div className="section-head reveal">
            <span className="section-label mono">04</span>
            <h2>Projects</h2>
          </div>

          {repoSource === 'fallback' && !loadingRepos ? (
            <p className="source-note mono reveal" data-delay="0.04">
              GitHub API unavailable — showing cached project data.
            </p>
          ) : null}

          <div className="projects-grid">
            {loadingRepos
              ? Array.from({ length: 6 }).map((_, i) => <div key={`skeleton-${i}`} className="project-card skeleton" />)
              : repos.map((repo, idx) => (
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    key={repo.id}
                    className="project-card reveal"
                    data-delay={idx * 0.04}
                  >
                    <div className="project-top">
                      <h3>{repo.name}</h3>
                      <span className="project-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </div>
                    <p>{repo.description}</p>
                    <div className="topics">
                      {(repo.topics || []).slice(0, 5).map((topic) => (
                        <span className="topic mono" key={topic}>
                          {topic}
                        </span>
                      ))}
                    </div>
                    <footer className="mono">
                      <span>{repo.language}</span>
                      <span>★ {repo.stargazers_count}</span>
                      <span>⑂ {repo.forks_count}</span>
                    </footer>
                  </a>
                ))}
          </div>
        </section>

        <section id="blog" className="section">
          <div className="section-head reveal">
            <span className="section-label mono">05</span>
            <h2>Blog</h2>
          </div>
          <div className="blog-list">
            <a className="blog-item reveal left-reveal" data-delay="0" href="https://shorturl.at/eoPbo" target="_blank" rel="noreferrer">
              <span>A Guide to Quantize YOLOv8 Object Detection Models Using ONNX</span>
              <em aria-hidden="true">→</em>
            </a>
            <a
              className="blog-item reveal left-reveal"
              data-delay="0.08"
              href="https://medium.com/@sulavstha007"
              target="_blank"
              rel="noreferrer"
            >
              <span>More writing on Medium</span>
              <em aria-hidden="true">→</em>
            </a>
          </div>
        </section>

        <section id="contact" className="section contact">
          <div className="reveal">
            <span className="section-label mono">06</span>
            <h2>Let&apos;s build something.</h2>
            <p>
              Open to full-time roles, research collaborations, and interesting problems in AI systems.
            </p>
          </div>
          <div className="contact-list">
            {contactLinks.map((item, idx) => (
              <a key={item.label} href={item.href} className="reveal" data-delay={idx * 0.06}>
                <span className="mono">{item.label}</span>
                <span>{item.value}</span>
                <em aria-hidden="true">→</em>
              </a>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export default App
