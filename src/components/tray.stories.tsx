import { useState, useRef } from 'react'
import { Tray, Subtray } from './tray'
import { Lorem } from './lorem'

export default {
  title: 'Tray',
}

export const Default = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Tray isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Lorem />
      </Tray>
    </>
  )
}

export const Scrollable = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Tray isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Lorem paragraphs={5} />
      </Tray>
    </>
  )
}

export const InitialFocus = () => {
  const initialFocusRef = useRef<any>()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Tray
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        // initialFocusRef={initialFocusRef} // FIXME:
      >
        <button>not me</button>
        <button ref={initialFocusRef}>me</button>
        <button onClick={() => setIsOpen(false)}>close</button>
      </Tray>
    </>
  )
}

export const Fullscreen = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Tray
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={{ isFullscreen: true }}
      >
        <Lorem />
      </Tray>
    </>
  )
}

export const FullscreenScrollable = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Tray
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={{ isFullscreen: true }}
      >
        <Lorem paragraphs={50} />
      </Tray>
    </>
  )
}

export const WithSubtray = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubtrayOpen, setIsSubtrayOpen] = useState(false)
  const [isNestedSubtrayOpen, setIsNestedSubtrayOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Tray isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Lorem paragraphs={2} />
        <button onClick={() => setIsSubtrayOpen(true)}>open</button>
        <Subtray isOpen={isSubtrayOpen} onClose={() => setIsSubtrayOpen(false)}>
          <button onClick={() => setIsNestedSubtrayOpen(true)}>open</button>
          <Subtray
            isOpen={isNestedSubtrayOpen}
            onClose={() => setIsNestedSubtrayOpen(false)}
          >
            <Lorem />
          </Subtray>
          <Lorem />
        </Subtray>
      </Tray>
    </>
  )
}
