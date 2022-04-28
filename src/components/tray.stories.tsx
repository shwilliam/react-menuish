import { useState, useRef } from 'react'
import { Tray } from './dialog-variant'
import { Lorem } from './lorem'

export default {
  title: 'Tray',
}

export const Default = () => {
  return (
    <Tray
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Lorem />
    </Tray>
  )
}

export const ExternalTrigger = () => {
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
  return (
    <Tray
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Lorem paragraphs={5} />
    </Tray>
  )
}

export const InitialFocus = () => {
  const initialFocusRef = useRef<any>()
  return (
    <Tray
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
      initialFocusRef={initialFocusRef}
    >
      <button>not me</button>
      <button ref={initialFocusRef}>me</button>
      <button>not me</button>
    </Tray>
  )
}

export const ExternalOpenState = () => {
  const initialFocusRef = useRef<any>()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Tray
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={({ ref }) => (
        <button ref={ref} onClick={() => setIsOpen(true)}>
          open
        </button>
      )}
      initialFocusRef={initialFocusRef}
    >
      <button>not me</button>
      <button ref={initialFocusRef}>me</button>
      <button onClick={() => setIsOpen(false)}>close</button>
    </Tray>
  )
}

export const Fullscreen = () => {
  return (
    <Tray
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
      isFullscreen
    >
      <Lorem />
    </Tray>
  )
}

export const FullscreenScrollable = () => {
  return (
    <Tray
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
      isFullscreen
    >
      <Lorem paragraphs={50} />
    </Tray>
  )
}

export const WithSubtrayTrigger = () => {
  return (
    <Tray
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Lorem paragraphs={2} />
      <Tray
        trigger={({ ref, open }) => (
          <button ref={ref} onClick={open}>
            open
          </button>
        )}
        isSubtray
      >
        <Lorem />
      </Tray>
    </Tray>
  )
}

export const WithSubtrayContainer = () => {
  const [isSubtrayOpen, setIsSubtrayOpen] = useState(false)
  return (
    <Tray
      onClose={() => setIsSubtrayOpen(false)}
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Lorem paragraphs={2} />
      <button onClick={() => setIsSubtrayOpen(true)}>open</button>
      <Tray
        isSubtray
        isOpen={isSubtrayOpen}
        onClose={() => setIsSubtrayOpen(false)}
      >
        <Lorem />
      </Tray>
    </Tray>
  )
}
