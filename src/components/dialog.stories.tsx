import { useState, useRef } from 'react'
import { Dialog, DialogContent } from './dialog'
import { Lorem } from './lorem'

export default {
  title: 'Dialog',
}

const Stuff = () => (
  <>
    <div>
      <Lorem />
    </div>
    <div>
      <div>
        <div>
          <button>hello</button>
        </div>
      </div>
    </div>
  </>
)

export const Default = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setIsOpen((s) => !s)}>
        {isOpen ? 'close' : 'open'}
      </button>
      <Dialog isOpen={isOpen}>
        <DialogContent>
          <Lorem />
        </DialogContent>
      </Dialog>
      <Stuff />
    </div>
  )
}

export const InitialFocus = () => {
  const [isOpen, setIsOpen] = useState(false)
  const initialFocusRef = useRef<any>()
  return (
    <div>
      <button onClick={() => setIsOpen((s) => !s)}>
        {isOpen ? 'close' : 'open'}
      </button>
      <Stuff />
      <Dialog isOpen={isOpen}>
        <DialogContent initialFocusRef={initialFocusRef}>
          <button>other</button>
          <button ref={initialFocusRef}>initial</button>
          <button onClick={() => setIsOpen(false)}>close</button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
