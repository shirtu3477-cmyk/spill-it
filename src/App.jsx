import { useState, useRef, useEffect } from 'react'
import './App.css'
import spillImg from './assets/7950F534-829B-4497-BD0E-425A1953A578_4_5005_c.jpeg'

function App() {
  const [text, setText] = useState('')
  // phase 0 = idle, 1 = eyes flying, 2 = brows showing, 3 = title shrunk
  const [phase, setPhase] = useState(0)
  const [hideImage, setHideImage] = useState(false)
  const textareaRef = useRef(null)
  const singleLineHeightRef = useRef(null)
  const lineHeightRef = useRef(null)
  const dot1Ref = useRef(null)
  const dot2Ref = useRef(null)
  const i1Ref = useRef(null)
  const i2Ref = useRef(null)

  // Capture single-line height on mount
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.rows = 1
    const h1 = ta.scrollHeight
    ta.rows = 2
    const h2 = ta.scrollHeight
    ta.rows = 1
    singleLineHeightRef.current = h1
    lineHeightRef.current = h2 - h1
  }, [])

  const handleChange = (e) => {
    const newText = e.target.value
    setText(newText)

    // Resize textarea
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = ta.scrollHeight + 'px'

      const lh = lineHeightRef.current
      const base = singleLineHeightRef.current

      // Trigger animation only when third row appears (two full rows typed)
      const isThirdRow = ta.scrollHeight > base + lh
      if (isThirdRow && phase === 0) {
        triggerAnimation()
      }

      // Reset back to idle when below 3 rows
      if (!isThirdRow && phase > 0) {
        setPhase(0)
        if (dot1Ref.current) {
          dot1Ref.current.style.transition = 'none'
          dot1Ref.current.style.transform = ''
        }
        if (dot2Ref.current) {
          dot2Ref.current.style.transition = 'none'
          dot2Ref.current.style.transform = ''
        }
      }

      // Fade image on fourth row
      const isFourthRow = ta.scrollHeight > base + lh * 2
      if (isFourthRow && !hideImage) setHideImage(true)
      if (!isFourthRow && hideImage) setHideImage(false)
    }
  }

  const triggerAnimation = () => {
    const dot1 = dot1Ref.current
    const dot2 = dot2Ref.current
    const i1 = i1Ref.current
    const i2 = i2Ref.current
    if (!dot1 || !dot2 || !i1 || !i2) return

    // Measure BEFORE any state change (DOM still has the i letters)
    const d1Rect = dot1.getBoundingClientRect()
    const d2Rect = dot2.getBoundingClientRect()
    const i1Rect = i1.getBoundingClientRect()
    const i2Rect = i2.getBoundingClientRect()

    const dy1 = i1Rect.top - d1Rect.top
    const dx1 = i1Rect.left + i1Rect.width / 2 - (d1Rect.left + d1Rect.width / 2)
    const dy2 = i2Rect.top - d2Rect.top
    const dx2 = i2Rect.left + i2Rect.width / 2 - (d2Rect.left + d2Rect.width / 2)

    // Snap dots to i positions silently
    dot1.style.transition = 'none'
    dot2.style.transition = 'none'
    dot1.style.transform = `translate(${dx1}px, ${dy1}px) scale(1.8)`
    dot2.style.transform = `translate(${dx2}px, ${dy2}px) scale(1.8)`

    // Force reflow so the snap registers
    dot1.getBoundingClientRect()

    // Phase 1: make face visible (dots are sitting on the i's — seamless swap)
    // and simultaneously start flying + switch title to dotless ı
    setPhase(1)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dot1.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
        dot2.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
        dot1.style.transform = 'translate(0, 0) scale(1)'
        dot2.style.transform = 'translate(0, 0) scale(1)'
      })
    })

    // Phase 2: eyebrows fade in after eyes land
    setTimeout(() => setPhase(2), 100)

    // Phase 3: title shrinks
    setTimeout(() => setPhase(3), 100)
  }

  // Title shows dotless ı as soon as phase >= 1 (dots are covering the i's)
  const showDotless = phase >= 1

  return (
    <div className={`app phase-${phase}`}>
      <div className="face">
        <div className="eyes">
          <span className="dot-wrapper"><span ref={dot1Ref} className="dot">•</span></span>
          <span className="dot-wrapper"><span ref={dot2Ref} className="dot">•</span></span>
        </div>
      </div>
      <h1 className="title">
        {showDotless
          ? 'Spıll ıt !'
          : <>Sp<span ref={i1Ref}>i</span>ll <span ref={i2Ref}>i</span>t !</>}
      </h1>
      <textarea
        ref={textareaRef}
        className="secret-input"
        value={text}
        onChange={handleChange}
        placeholder=""
        rows={1}
      />
      <img src={spillImg} className={`teacup${hideImage ? ' hidden' : ''}`} alt="Spill it" />
    </div>
  )
}

export default App
