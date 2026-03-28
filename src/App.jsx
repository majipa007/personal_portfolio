import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { fetchPortfolioRepos } from './lib/github'
import { getSkillFallbackLabel, getSkillIcon } from './lib/skillIcons'
import portfolioConfig from './config/portfolio.json'

const { navigation, hero, about, experience, skills, projects, blog, contact } = portfolioConfig

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
          if (Array.isArray(obj.material)) obj.material.forEach((mat) => mat.dispose())
          else obj.material.dispose()
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

    const hoverables = document.querySelectorAll('a, button, [data-hoverable="true"]')
    const handlers = []

    hoverables.forEach((el) => {
      const onEnter = () => {
        hovering = true
      }
      const onLeave = () => {
        hovering = false
      }
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
      handlers.push({ el, onEnter, onLeave })
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
      handlers.forEach(({ el, onEnter, onLeave }) => {
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

function App() {
  const [repos, setRepos] = useState([])
  const [repoSource, setRepoSource] = useState('api')
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [navSolid, setNavSolid] = useState(false)

  const revealTargets = useMemo(
    () => [
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
      const result = await fetchPortfolioRepos({
        url: projects.apiUrl,
        fallbackRepos: projects.fallbackRepos,
        limit: projects.limit,
        emptyDescription: projects.emptyDescription,
      })
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

    return () => timeline.kill()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const delay = Number(entry.target.getAttribute('data-delay') || 0)
          gsap.to(entry.target, { opacity: 1, y: 0, x: 0, duration: 0.7, delay, ease: 'power2.out' })
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
    const onScroll = () => setNavSolid(window.scrollY > 60)
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

    return () => handlers.forEach(({ el, onEnter }) => el.removeEventListener('mouseenter', onEnter))
  }, [])

  return (
    <>
      <CustomCursor />
      <header className={`site-nav ${navSolid ? 'solid' : ''}`}>
        <a className="brand mono" href="#top">
          {navigation.brand}
        </a>
        <nav>
          {navigation.items.map((item) => (
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
            <p className="hero-label mono">{hero.roleLabel}</p>
            <h1 className="hero-name">{hero.name}</h1>
            <p className="hero-tagline">{hero.tagline}</p>
            <div className="hero-actions">
              {hero.actions.map((action) => (
                <a key={action.label} href={action.href} className={`btn btn-${action.variant}`}>
                  {action.label}
                </a>
              ))}
            </div>
          </div>
          <div className="scroll-hint mono">
            <span className="line" />
            {hero.scrollLabel}
          </div>
        </section>

        <section id="about" className="section">
          <div className="section-head reveal">
            <span className="section-label mono">{about.sectionNumber}</span>
            <h2>{about.title}</h2>
          </div>
          <div className="about-grid">
            <div className="about-copy reveal" data-delay="0.05">
              {about.bioParagraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              {about.interestsTitle ? <p className="about-interests-title">{about.interestsTitle}</p> : null}

              {about.interests?.length ? (
                <ul className="about-interests-list">
                  {about.interests.map((interest) => (
                    <li key={interest}>{interest}</li>
                  ))}
                </ul>
              ) : null}

              {about.closing ? <p>{about.closing}</p> : null}
            </div>
            <aside className="about-side reveal" data-delay="0.1">
              <h3 className="mono">{about.sidebarTitle}</h3>
              <ul>
                {about.currently.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="social-links">
                {about.links.map((link) => (
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
            <span className="section-label mono">{experience.sectionNumber}</span>
            <h2>{experience.title}</h2>
          </div>
          <div className="timeline">
            {experience.items.map((item, idx) => (
              <article className="timeline-item reveal left-reveal" data-delay={idx * 0.08} key={`${item.company}-${item.role}`}>
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
            <span className="section-label mono">{skills.sectionNumber}</span>
            <h2>{skills.title}</h2>
          </div>
          <div className="skills-grid reveal" data-delay="0.05">
            {skills.groups.map((group) => (
              <div key={group.name} className="skill-col">
                <h3 className="mono">{group.name}</h3>
                <ul>
                  {group.items.map((item, idx) => {
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
            <span className="section-label mono">{projects.sectionNumber}</span>
            <h2>{projects.title}</h2>
          </div>

          {repoSource === 'fallback' && !loadingRepos ? (
            <p className="source-note mono reveal" data-delay="0.04">
              {projects.fallbackMessage}
            </p>
          ) : null}

          <div className="projects-grid">
            {loadingRepos
              ? Array.from({ length: projects.limit }).map((_, i) => <div key={`skeleton-${i}`} className="project-card skeleton" />)
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
            <span className="section-label mono">{blog.sectionNumber}</span>
            <h2>{blog.title}</h2>
          </div>
          <div className="blog-list">
            {blog.items.map((item, idx) => (
              <a
                key={item.title}
                className="blog-item reveal left-reveal"
                data-delay={idx * 0.08}
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                <span>{item.title}</span>
                <em aria-hidden="true">→</em>
              </a>
            ))}
          </div>
        </section>

        <section id="contact" className="section contact">
          <div className="reveal">
            <span className="section-label mono">{contact.sectionNumber}</span>
            <h2>{contact.title}</h2>
            <p>{contact.subtitle}</p>
          </div>
          <div className="contact-list">
            {contact.links.map((item, idx) => (
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
