import { useState, useRef } from 'react'
import { Dialog, DialogContent } from './dialog'
import { Lorem } from './lorem'

export default {
  title: 'Dialog',
  parameters: {
    docs: {
      description: {
        component: `The \`Dialog\` and \`DialogContent\` components are
        primarily used to hide all content outside itself from the a11y tree on
        mount and restores them on unmount. They also handle locking scroll,
        trapping focus and portalling, if desired. It is typically only used as
        part of other abstractions, such as modals or trays, ensuring only the
        top-most dialog is accessible; you likely won't want to use it directly.
        The \`Dialog\` component expects a single child of \`DialogContent\`
        (separated for easier styling). Because dialogs hide all content outside
        itself to screen readers, they expect to have a focusable child to focus
        on open and trap focus.`,
      },
    },
  },
}

export const Default = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Dialog isOpen={isOpen}>
        <DialogContent>
          <button onClick={() => setIsOpen(false)}>close</button>
          <Lorem />
        </DialogContent>
      </Dialog>
    </>
  )
}

export const NoFocusLock = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Dialog isOpen={isOpen}>
        <DialogContent noFocusLock>
          <button onClick={() => setIsOpen(false)}>close</button>
          <Lorem />
        </DialogContent>
      </Dialog>
    </>
  )
}

export const InitialFocus = () => {
  const [isOpen, setIsOpen] = useState(false)
  const initialFocusRef = useRef<any>()
  return (
    <>
      <button onClick={() => setIsOpen((s) => !s)}>
        {isOpen ? 'close' : 'open'}
      </button>
      <Dialog isOpen={isOpen}>
        <DialogContent initialFocusRef={initialFocusRef}>
          <button>other</button>
          <button ref={initialFocusRef}>initial</button>
          <button onClick={() => setIsOpen(false)}>close</button>
        </DialogContent>
      </Dialog>
    </>
  )
}
