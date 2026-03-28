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

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x080808, 1)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)

    const getSceneOffsetX = () => {
      if (window.innerWidth >= 1280) return 8
      if (window.innerWidth >= 1024) return 6.7
      if (window.innerWidth >= 760) return 4.5
      return 2
    }

    let sceneOffsetX = getSceneOffsetX()
    camera.position.set(sceneOffsetX, 0, 28)

    const rig = new THREE.Group()
    rig.position.x = sceneOffsetX
    scene.add(rig)

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      sceneOffsetX = getSceneOffsetX()
      rig.position.x = sceneOffsetX
    }
    resize()
    window.addEventListener('resize', resize)

    const NUM_HEADS = 4
    const TOKENS_PER_ROW = 10
    const NUM_LAYERS = 4
    const LAYER_GAP = 7.5
    const TOKEN_SPREAD = 2.4
    const HEAD_COLORS = [
      new THREE.Color(0x6e6e6e),
      new THREE.Color(0x808080),
      new THREE.Color(0x929292),
      new THREE.Color(0xa6a6a6),
    ]

    const makeTokenMesh = (color, size = 0.18, opacity = 1) => {
      const geo = new THREE.CircleGeometry(size, 16)
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
      return new THREE.Mesh(geo, mat)
    }

    const makeArcPoints = (startPos, endPos, lift, segments = 28) => {
      const pts = []
      for (let i = 0; i <= segments; i += 1) {
        const t = i / segments
        const x = startPos.x + (endPos.x - startPos.x) * t
        const y = startPos.y + (endPos.y - startPos.y) * t + lift * Math.sin(Math.PI * t)
        const z = startPos.z + (endPos.z - startPos.z) * t
        pts.push(new THREE.Vector3(x, y, z))
      }
      return pts
    }

    const rebuildHeadArcs = (layer, head, queryIndex) => {
      head.lines.forEach(({ line, targetIndex }) => {
        if (targetIndex === queryIndex) {
          line.material.opacity = 0
          line.userData.targetOpacity = 0
          return
        }

        const pts = makeArcPoints(
          layer.tokenPositions[queryIndex],
          layer.tokenPositions[targetIndex],
          1.2 + line.userData.weight * 2.5,
        )
        const geo = new THREE.BufferGeometry().setFromPoints(pts)
        line.geometry.dispose()
        line.geometry = geo
        line.userData.targetOpacity = line.userData.weight * 0.55 + 0.05
      })

      head.queryIndex = queryIndex
      head.qMesh.position.copy(layer.tokenPositions[queryIndex])
      head.qMesh.material.opacity = 0.9
    }

    const allLayers = []

    for (let layerIndex = 0; layerIndex < NUM_LAYERS; layerIndex += 1) {
      const layerY = (layerIndex - (NUM_LAYERS - 1) / 2) * LAYER_GAP
      const layerGroup = new THREE.Group()
      layerGroup.position.y = layerY

      const tokenPositions = []
      for (let t = 0; t < TOKENS_PER_ROW; t += 1) {
        const x = (t - (TOKENS_PER_ROW - 1) / 2) * TOKEN_SPREAD
        tokenPositions.push(new THREE.Vector3(x, 0, 0))
      }

      tokenPositions.forEach((pos) => {
        const mesh = makeTokenMesh(0x888070, 0.16, 0.55)
        mesh.position.copy(pos)
        layerGroup.add(mesh)
      })

      const headArcs = []
      for (let h = 0; h < NUM_HEADS; h += 1) {
        const queryIndex = Math.floor(Math.random() * TOKENS_PER_ROW)
        const lines = []

        for (let k = 0; k < TOKENS_PER_ROW; k += 1) {
          if (k === queryIndex) continue

          const weight = 0.05 + Math.random() * 0.95
          const lift = 1.2 + weight * 2.5
          const pts = makeArcPoints(tokenPositions[queryIndex], tokenPositions[k], lift)
          const geo = new THREE.BufferGeometry().setFromPoints(pts)
          const mat = new THREE.LineBasicMaterial({
            color: HEAD_COLORS[h],
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })

          const line = new THREE.Line(geo, mat)
          line.userData = {
            weight,
            targetOpacity: weight * 0.55 + 0.05,
            phase: Math.random() * Math.PI * 2,
          }

          layerGroup.add(line)
          lines.push({ line, targetIndex: k })
        }

        const qMesh = makeTokenMesh(HEAD_COLORS[h], 0.22, 0)
        qMesh.position.copy(tokenPositions[queryIndex])
        qMesh.position.z = 0.1
        layerGroup.add(qMesh)

        headArcs.push({ lines, qMesh, queryIndex })
      }

      if (layerIndex > 0) {
        const lineColor = new THREE.Color(0x2a2820)
        tokenPositions.forEach((pos) => {
          const pts = [new THREE.Vector3(pos.x, 0, 0), new THREE.Vector3(pos.x, -LAYER_GAP + 0.2, 0)]
          const geo = new THREE.BufferGeometry().setFromPoints(pts)
          const mat = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0.6 })
          layerGroup.add(new THREE.Line(geo, mat))
        })
      }

      rig.add(layerGroup)
      allLayers.push({ layerGroup, headArcs, tokenPositions })
    }

    const CYCLE_INTERVAL = 2600
    const layerTimers = allLayers.map((_, i) => -i * 650)

    let mouseX = 0
    let mouseY = 0

    const onMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('mousemove', onMouseMove)

    const shiftQuery = (layerIdx, headIdx) => {
      const layer = allLayers[layerIdx]
      const head = layer.headArcs[headIdx]

      head.lines.forEach(({ line }) => {
        line.userData.targetOpacity = 0
      })
      head.qMesh.material.opacity = 0

      let newQuery = Math.floor(Math.random() * TOKENS_PER_ROW)
      while (newQuery === head.queryIndex) {
        newQuery = Math.floor(Math.random() * TOKENS_PER_ROW)
      }

      rebuildHeadArcs(layer, head, newQuery)
    }

    let camTime = 0
    let raf = 0
    let lastTs = 0

    const animate = (ts) => {
      if (!lastTs) lastTs = ts
      const dt = Math.min(16, ts - lastTs)
      lastTs = ts
      camTime += dt * 0.001

      camera.position.x += (sceneOffsetX + mouseX * 2.8 - camera.position.x) * 0.04
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.04
      camera.position.z = 28 + Math.sin(camTime * 0.18) * 0.8
      camera.lookAt(sceneOffsetX, 0, 0)

      rig.rotation.y = Math.sin(camTime * 0.08) * 0.06
      rig.rotation.x = Math.cos(camTime * 0.06) * 0.03

      allLayers.forEach((layer, li) => {
        layerTimers[li] += dt
        if (layerTimers[li] > CYCLE_INTERVAL) {
          layerTimers[li] = 0
          shiftQuery(li, Math.floor(Math.random() * NUM_HEADS))
        }

        layer.headArcs.forEach((head, hi) => {
          head.lines.forEach(({ line }) => {
            const target = line.userData.targetOpacity
            const pulse = 1 + 0.12 * Math.sin(camTime * 1.4 + line.userData.phase)
            line.material.opacity += (target * pulse - line.material.opacity) * 0.06
          })

          if (head.qMesh.material.opacity > 0.01) {
            head.qMesh.material.opacity = 0.7 + 0.25 * Math.sin(camTime * 2.2 + hi * 1.3)
          }
        })
      })

      renderer.render(scene, camera)
      raf = window.requestAnimationFrame(animate)
    }

    const initTimer = window.setTimeout(() => {
      allLayers.forEach((layer) => {
        layer.headArcs.forEach((head) => {
          head.lines.forEach(({ line }) => {
            line.userData.targetOpacity = line.userData.weight * 0.55 + 0.05
          })
          head.qMesh.material.opacity = 0.9
        })
      })
    }, 400)

    raf = window.requestAnimationFrame(animate)

    return () => {
      window.clearTimeout(initTimer)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
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
