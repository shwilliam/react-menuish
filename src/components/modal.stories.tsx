import { useState, useRef } from 'react'
import * as Modal from './modal'
import { Menu } from './menu'
import { Item } from './listbox'
import { Lorem } from './lorem'
import { fruits } from '../util/fruits'
import { useDialogContext } from './dialog'

export default {
  title: 'Modal',
}

const DialogCloseButton = () => {
  const { onClose } = useDialogContext()
  return <button onClick={onClose}>close</button>
}

export const Default = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal.Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DialogCloseButton />
      </Modal.Dialog>
    </>
  )
}

export const WithTrigger = () => {
  return (
    <Modal.Dialog
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <DialogCloseButton />
    </Modal.Dialog>
  )
}

export const WithOverlay = () => {
  return (
    <Modal.Dialog isOpen overlay>
      <button>button</button>
    </Modal.Dialog>
  )
}

export const Scrollable = () => {
  return (
    <Modal.Dialog isOpen>
      <Modal.Header>
        <Modal.Title>
          a very looooooooooong title that prolly gonnna have to wrap
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <button>button</button>
        <Lorem paragraphs={10} />
      </Modal.Body>
    </Modal.Dialog>
  )
}

export const InitialFocus = () => {
  const initialFocusRef = useRef<any>()
  return (
    <Modal.Dialog isOpen initialFocusRef={initialFocusRef}>
      <button>not me</button>
      <button ref={initialFocusRef}>me</button>
      <button>not me</button>
    </Modal.Dialog>
  )
}

export const WithMenu = () => {
  return (
    <Modal.Dialog isOpen>
      <Menu
        trigger={({ ref, open }) => (
          <button ref={ref} onClick={open}>
            menu
          </button>
        )}
      >
        {fruits.map((f) => (
          <Item key={f}>{f}</Item>
        ))}
      </Menu>
    </Modal.Dialog>
  )
}

export const Nested = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal.Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} overlay>
        <Nested />
        <DialogCloseButton />
      </Modal.Dialog>
    </>
  )
}
