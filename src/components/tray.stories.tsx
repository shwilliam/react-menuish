import { useState, useRef } from 'react'
import { Tray } from './tray'
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
        initialFocusRef={initialFocusRef}
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
      <Tray isOpen={isOpen} onClose={() => setIsOpen(false)} isFullscreen>
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
      <Tray isOpen={isOpen} onClose={() => setIsOpen(false)} isFullscreen>
        <Lorem paragraphs={5} />
      </Tray>
    </>
  )
}
