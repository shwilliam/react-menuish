import { useState, useRef } from 'react'
import { Tray, Subtray } from './tray'
import { Lorem } from './lorem'
import { DialogTrigger, TrayVariant } from './dialog-variant'

export default {
  title: 'Tray',
}

export const Default = () => {
  return (
    <TrayVariant
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Lorem />
    </TrayVariant>
  )
}

export const Scrollable = () => {
  return (
    <TrayVariant
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Lorem paragraphs={5} />
    </TrayVariant>
  )
}

export const InitialFocus = () => {
  const initialFocusRef = useRef<any>()
  return (
    <TrayVariant
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
      dialog={{ initialFocusRef }}
    >
      <button>not me</button>
      <button ref={initialFocusRef}>me</button>
    </TrayVariant>
  )
}

export const Fullscreen = () => {
  return (
    <TrayVariant
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
      isFullscreen
    >
      <Lorem />
    </TrayVariant>
  )
}

export const WithSubtray = () => {
  return (
    <TrayVariant
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Lorem paragraphs={2} />
      <TrayVariant
        isSubtray
        trigger={({ ref, open }) => (
          <button ref={ref} onClick={open}>
            open
          </button>
        )}
      >
        <TrayVariant
          isSubtray
          trigger={({ ref, open }) => (
            <button ref={ref} onClick={open}>
              open
            </button>
          )}
        >
          <Lorem />
        </TrayVariant>
        <Lorem />
      </TrayVariant>
    </TrayVariant>
  )
}
