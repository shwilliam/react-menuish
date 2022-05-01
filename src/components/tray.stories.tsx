import { useState, useRef } from 'react'
import { Tray, Subtray } from './tray'
import { Lorem } from './lorem'
import { DialogTrigger } from './dialog'

export default {
  title: 'Tray',
}

export const Default = () => {
  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Tray>
        <Lorem />
      </Tray>
    </DialogTrigger>
  )
}

// export const Scrollable = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   return (
//     <>
//       <button onClick={() => setIsOpen(true)}>open</button>
//       <Tray isOpen={isOpen} onClose={() => setIsOpen(false)}>
//         <Lorem paragraphs={5} />
//       </Tray>
//     </>
//   )
// }

// export const InitialFocus = () => {
//   const initialFocusRef = useRef<any>()
//   const [isOpen, setIsOpen] = useState(false)
//   return (
//     <>
//       <button onClick={() => setIsOpen(true)}>open</button>
//       <Tray
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//         // initialFocusRef={initialFocusRef} // FIXME:
//       >
//         <button>not me</button>
//         <button ref={initialFocusRef}>me</button>
//         <button onClick={() => setIsOpen(false)}>close</button>
//       </Tray>
//     </>
//   )
// }

// export const Fullscreen = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   return (
//     <>
//       <button onClick={() => setIsOpen(true)}>open</button>
//       <Tray
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//         content={{ isFullscreen: true }}
//       >
//         <Lorem />
//       </Tray>
//     </>
//   )
// }

// export const FullscreenScrollable = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   return (
//     <>
//       <button onClick={() => setIsOpen(true)}>open</button>
//       <Tray
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//         content={{ isFullscreen: true }}
//       >
//         <Lorem paragraphs={50} />
//       </Tray>
//     </>
//   )
// }

export const WithSubtray = () => {
  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Tray>
        <Lorem paragraphs={2} />
        <DialogTrigger
          trigger={({ ref, open }) => (
            <button ref={ref} onClick={open}>
              open
            </button>
          )}
        >
          <Subtray>
            <DialogTrigger
              trigger={({ ref, open }) => (
                <button ref={ref} onClick={open}>
                  open
                </button>
              )}
            >
              <Subtray>
                <Lorem />
              </Subtray>
            </DialogTrigger>
            <Lorem />
          </Subtray>
        </DialogTrigger>
      </Tray>
    </DialogTrigger>
  )
}
