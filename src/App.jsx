import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { siteConfig } from './siteConfig'
import './App.css'

const revealVariants = {
  hidden: { opacity: 0, rotateX: -10, y: 40 },
  visible: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

function Reveal({ children, className = '', delay = 0, ...props }) {
  const reducedMotion = useReducedMotion()
  return <motion.div className={className} variants={revealVariants} initial={reducedMotion ? false : 'hidden'} whileInView="visible" viewport={{ once: true, margin: '-12% 0px' }} transition={{ delay }} {...props}>{children}</motion.div>
}

function MotionGroup({ children, className = '', ...props }) {
  const reducedMotion = useReducedMotion()
  return <motion.div className={className} variants={staggerVariants} initial={reducedMotion ? false : 'hidden'} whileInView="visible" viewport={{ once: true, margin: '-10% 0px' }} {...props}>{children}</motion.div>
}

function Tilt({ children, className = '', as = 'div', style, ...props }) {
  const reducedMotion = useReducedMotion()
  const finePointer = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth > 768
  const rotateX = useSpring(useMotionValue(0), { stiffness: 180, damping: 18, mass: 0.35 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 180, damping: 18, mass: 0.35 })
  const MotionTag = motion[as] || motion.div

  const handlePointerMove = (event) => {
    if (reducedMotion || !finePointer || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    rotateX.set(-y * 7)
    rotateY.set(x * 7)
  }

  const resetTilt = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return <MotionTag className={className} style={{ ...style, rotateX, rotateY }} onPointerMove={handlePointerMove} onPointerLeave={resetTilt} whileHover={reducedMotion || !finePointer ? undefined : { scale: 1.015, translateZ: 8 }} {...props}>{children}</MotionTag>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [galleryFilter, setGalleryFilter] = useState('All')
  const [lightbox, setLightbox] = useState(null)
  const [testimonial, setTestimonial] = useState(0)
  const [toast, setToast] = useState('')
  const [showTop, setShowTop] = useState(false)
  const reducedMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const heroTextY = useTransform(scrollY, [0, 700], [0, reducedMotion ? 0 : 70])
  const heroVisualY = useTransform(scrollY, [0, 700], [0, reducedMotion ? 0 : -35])

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 4200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const closeMenu = () => setMenuOpen(false)
  const filteredGallery = galleryFilter === 'All' ? siteConfig.gallery : siteConfig.gallery.filter((item) => item.category === galleryFilter)
  const nextTestimonial = (direction) => setTestimonial((current) => (current + direction + siteConfig.testimonials.length) % siteConfig.testimonials.length)

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    form.reset()
    setToast('Enquiry received. We will be in touch soon.')
  }

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu}>
          <img src="/logo.jpeg" alt="Ranbhoomi logo" />
          <span className="brand-copy"><span>{siteConfig.brand.name}</span><small>{siteConfig.brand.tagline}</small></span>
        </a>
        <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <i /><i /><i />
        </button>
        <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
          {siteConfig.nav.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}</a>)}
          <a className="nav-cta" href="#contact" onClick={closeMenu}>Join training <span>↗</span></a>
        </nav>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-grid" />
          <Reveal className="hero-copy reveal" style={{ y: heroTextY }}>
            <p className="eyebrow"><span className="red-line" /> Discipline / Skill / Strength / Confidence</p>
            <h1>Train hard.<br /><em>Fight smart.</em><br />Become unstoppable.</h1>
            <p className="hero-intro">Professional MMA, Kickboxing, Boxing &amp; Strength Conditioning Training.</p>
            <div className="hero-actions"><a className="button button-red" href="#contact">Start training <span>↗</span></a><a className="button button-ghost" href="#programs">View programs <span>↓</span></a></div>
          </Reveal>
          <Tilt className="hero-visual" style={{ y: heroVisualY }}>
            <div className="placeholder placeholder-hero"><img src="/img1.png" alt="RANBHOOMI fighter in the arena" /><div className="hero-image-overlay" /><span>RANBHOOMI Fighter</span></div>
            <div className="hero-stamp">RNB<br /><span>01</span></div>
            <div className="hero-caption">The arena is waiting.<br /><span>Are you ready?</span></div>
          </Tilt>
          <a className="scroll-cue" href="#about" aria-label="Scroll to about section"><span>Scroll to enter</span><b>↓</b></a>
        </section>

        <section className="credibility-strip" aria-label="Achievements">
          {siteConfig.credibility.map((item) => <div className="credibility-item" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
        </section>

        <motion.section className="section about-section" id="about" variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-12% 0px' }}>
          <div className="section-label">01 / The mindset</div>
          <Reveal className="about-layout"><div><p className="eyebrow">More than a gym</p><h2>It&apos;s a fighter&apos;s <em>mindset.</em></h2></div><div className="about-copy"><p>RANBHOOMI is built for people who want more from their training. We develop combat skills, physical conditioning, discipline, confidence and the competitive mindset to perform under pressure.</p><a className="text-link" href="#coaches">Discover Ranbhoomi <span>↗</span></a></div></Reveal>
          <MotionGroup className="feature-grid">{[['01', 'MMA Training', 'Complete mixed martial arts training.'], ['02', 'Striking', 'Kickboxing and Boxing focused training.'], ['03', 'Strength & Conditioning', 'Improve strength, endurance, mobility and athletic performance.'], ['04', 'Combat Discipline', 'Build confidence, discipline and competitive mindset.']].map(([number, title, text]) => <Tilt as="article" className="feature-card" variants={revealVariants} key={title}><span>{number}</span><h3>{title}</h3><p>{text}</p><b>+</b></Tilt>)}</MotionGroup>
        </motion.section>

        <motion.section className="section programs-section" id="programs" variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-12% 0px' }}><Reveal className="section-heading"><div><div className="section-label">02 / The disciplines</div><h2>Choose your <em>arena.</em></h2></div><p>Every session has a purpose. Every round moves you forward.</p></Reveal><MotionGroup className="program-list">{siteConfig.programs.map((program) => <Tilt as="article" className="program-row" variants={revealVariants} key={program.title}><span className="program-number">{program.number}</span><h3>{program.title}</h3><span className="program-tag">{program.short}</span><p>{program.description}</p><span className="row-arrow">↗</span></Tilt>)}</MotionGroup><Reveal><a className="button button-red" href="#contact">View training programs <span>↗</span></a></Reveal></motion.section>

        <motion.section className="coaches-section" id="coaches" variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-12% 0px' }}>
          <Reveal className="section coach-intro">
            <div className="section-label">03 / The corner</div>
            <h2>Learn from <em>experience.</em></h2>
            <p>Professional coaching. Real combat sports experience. A standard that keeps moving.</p>
          </Reveal>
          <MotionGroup className="coach-grid">
            {siteConfig.coaches.map((coach, index) => (
              <Tilt as="article" className={`coach-card ${index === 0 ? 'featured' : ''}`} variants={revealVariants} key={coach.name}>
                <div className="coach-photo">
                  {coach.image ? (
                    <img src={coach.image} alt={coach.name} />
                  ) : (
                    <div className="placeholder"><span>{coach.imageLabel}</span></div>
                  )}
                </div>
                <div className="coach-info">
                  <div>
                    <span className="coach-index">0{index + 1}</span>
                    <h3>{coach.name}</h3>
                    <p className="coach-role">{coach.role}</p>
                  </div>
                  <p className="coach-bio">{coach.bio}</p>
                  <details>
                    <summary>Credentials <span>+</span></summary>
                    <ul>{coach.credentials.map((credential) => <li key={credential}>{credential}</li>)}</ul>
                  </details>
                  {index === 0 && <blockquote>&ldquo;{coach.philosophy}&rdquo;</blockquote>}
                </div>
              </Tilt>
            ))}
          </MotionGroup>
        </motion.section>

        <motion.section className="benefits-section" variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-12% 0px' }}><Reveal className="section benefits-header"><div className="section-label">04 / The standard</div><h2>Why train at <em>Ranbhoomi?</em></h2></Reveal><MotionGroup className="benefit-grid">{siteConfig.benefits.map((benefit, index) => <Tilt as="div" className="benefit" variants={revealVariants} key={benefit}><span>0{index + 1}</span><i>{['◈', '◉', '✦', '△', '⊕', '◇'][index]}</i><h3>{benefit}</h3><b>↗</b></Tilt>)}</MotionGroup></motion.section>

        <motion.section className="section gallery-section" id="gallery" variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-12% 0px' }}><Reveal className="section-heading"><div><div className="section-label">06 / The archive</div><h2>Inside the <em>arena.</em></h2></div><p>Moments of work, focus and progress.</p></Reveal><Reveal><div className="filter-bar" role="tablist">{['All', 'MMA', 'Kickboxing', 'Boxing', 'Training', 'Events'].map((filter) => <button className={galleryFilter === filter ? 'active' : ''} type="button" key={filter} onClick={() => setGalleryFilter(filter)}>{filter}</button>)}</div></Reveal><MotionGroup className="gallery-grid">{filteredGallery.map((item) => <Tilt as="button" className="gallery-card" type="button" variants={revealVariants} key={item.detail} onClick={() => setLightbox(item)}><img src={item.image} alt={item.label} /><span className="gallery-meta">{item.category} <b>↗</b></span></Tilt>)}</MotionGroup></motion.section>

        <motion.section className="testimonial-section" id="testimonials" variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-12% 0px' }}><div className="section-label">07 / The voice</div><Reveal><h2>What our <em>fighters</em> say.</h2></Reveal><Tilt className="testimonial"><button type="button" aria-label="Previous testimonial" onClick={() => nextTestimonial(-1)}>←</button><blockquote>&ldquo;{siteConfig.testimonials[testimonial].quote}&rdquo;{siteConfig.testimonials[testimonial].author}</blockquote><button type="button" aria-label="Next testimonial" onClick={() => nextTestimonial(1)}>→</button></Tilt></motion.section>

        <motion.section className="section timeline-section" variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-12% 0px' }}><Reveal className="section-heading"><div><div className="section-label">08 / The record</div><h2>Built through <em>experience.</em></h2></div></Reveal><MotionGroup className="timeline">{siteConfig.timeline.map((item, index) => <Tilt as="div" className="timeline-item" variants={revealVariants} key={item}><span>0{index + 1}</span><strong>{item}</strong></Tilt>)}</MotionGroup></motion.section>

        <motion.section className="contact-section" id="contact" variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-12% 0px' }}><Reveal className="section contact-heading"><div className="section-label">09 / Your move</div><h2>Ready to start <em>training?</em></h2><p>Take the first step toward becoming stronger, sharper and more disciplined.</p><div className="contact-details"><span>WhatsApp <strong>{siteConfig.contact.whatsapp}</strong></span><span>Phone <strong>{siteConfig.contact.phone}</strong></span><span>Location <strong><a href="https://maps.app.goo.gl/z4YZRQ8hiJJGpZHR7" target="_blank" rel="noreferrer">{siteConfig.contact.location}</a></strong></span></div></Reveal><motion.form className="contact-form" onSubmit={handleSubmit} variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-12% 0px' }}><div className="form-row"><label>Name<input name="name" required placeholder="Your full name" /></label><label>Phone number<input name="phone" required pattern="[0-9+() -]{7,}" placeholder="Your phone number" /></label></div><div className="form-row"><label>Email<input type="email" name="email" required /></label><label>Training interest<select name="interest" required defaultValue=""><option value="" disabled>Select a discipline</option>{['MMA', 'Kickboxing', 'Boxing', 'Muay Thai', 'Strength & Conditioning', 'General Enquiry'].map((option) => <option key={option}>{option}</option>)}</select></label></div><label>Message<textarea name="message" rows="4" required placeholder="Tell us what you want to work on..." /></label><button className="button button-red" type="submit">Send enquiry <span>↗</span></button></motion.form></motion.section>
      </main>

      <footer className="site-footer"><div className="brand"><img src="/logo.jpeg" alt="Ranbhoomi logo" /><span className="brand-copy"><span>{siteConfig.brand.name}</span><small>{siteConfig.brand.tagline}</small></span></div><p>{siteConfig.brand.motto}</p><div className="footer-links">{siteConfig.nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div><div className="footer-bottom"><span>© 2026 RANBHOOMI The Combat Arena. All rights reserved.</span><span>Instagram&nbsp;&nbsp; YouTube&nbsp;&nbsp; Facebook</span></div></footer>
    </div>

      <a className="whatsapp" href={siteConfig.whatsapp.number ? `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(siteConfig.whatsapp.message)}` : '#contact'} target={siteConfig.whatsapp.number ? '_blank' : undefined} rel="noreferrer" aria-label="Chat on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.5 3.5A11.85 11.85 0 0 0 12.08 0C5.53 0 .2 5.32.2 11.87c0 2.09.55 4.13 1.59 5.93L.1 23.9l6.25-1.64a11.84 11.84 0 0 0 5.72 1.46h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.23-6.15-3.45-8.35ZM12.08 21.7h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.71.97.99-3.62-.24-.37a9.84 9.84 0 1 1 8.34 4.6Zm5.4-7.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" /></svg></a>
      {showTop && <button className="back-top" type="button" aria-label="Back to top" onClick={scrollTop}>↑</button>}
      {toast && <div className="toast" role="status">{toast}<button type="button" onClick={() => setToast('')}>×</button></div>}
      {lightbox && <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.label} onClick={() => setLightbox(null)}><div className="lightbox-content" onClick={(event) => event.stopPropagation()}><button type="button" aria-label="Close gallery" onClick={() => setLightbox(null)}>×</button><img src={lightbox.image} alt={lightbox.label} /><p>{lightbox.label}</p></div></div>}
    </>
  )
}

export default App;