import { useState, useRef } from 'react'
import * as Modal from './modal'
import { Menu } from './menu'
import { Item } from './listbox'
import { useDialogContext } from './dialog'
import { ModalDialog } from './dialog-variant'
import { fruits } from '../util/fruits'
import { Lorem } from './lorem'

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
      <ModalDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DialogCloseButton />
      </ModalDialog>
    </>
  )
}

export const WithTrigger = () => {
  return (
    <ModalDialog
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <DialogCloseButton />
    </ModalDialog>
  )
}

export const NoOverlay = () => {
  return (
    <ModalDialog isOpen overlay={false}>
      <button>button</button>
    </ModalDialog>
  )
}

export const Scrollable = () => {
  return (
    <ModalDialog isOpen>
      <Modal.Header>
        <Modal.Title>
          a very looooooooooong title that prolly gonnna have to wrap
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <button>button</button>
        <Lorem paragraphs={10} />
      </Modal.Body>
    </ModalDialog>
  )
}

export const InitialFocus = () => {
  const initialFocusRef = useRef<any>()
  return (
    <ModalDialog isOpen initialFocusRef={initialFocusRef}>
      <button>not me</button>
      <button ref={initialFocusRef}>me</button>
      <button>not me</button>
    </ModalDialog>
  )
}

export const WithMenu = () => {
  return (
    <ModalDialog isOpen>
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
    </ModalDialog>
  )
}

export const Nested = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <ModalDialog isOpen={isOpen} onClose={() => setIsOpen(false)} overlay>
        <Nested />
        <DialogCloseButton />
      </ModalDialog>
    </>
  )
}
