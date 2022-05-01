import { useState, useRef } from 'react'
import * as Modal from './modal'
import { Menu } from './menu'
import { Item } from './listbox'
import { Lorem } from './lorem'
import { fruits } from '../util/fruits'
import { DialogContainer, DialogTrigger, useDialogContext } from './dialog'

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
      <DialogContainer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Dialog>
          <DialogCloseButton />
        </Modal.Dialog>
      </DialogContainer>
    </>
  )
}

export const WithTrigger = () => {
  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Modal.Dialog>
        <DialogCloseButton />
      </Modal.Dialog>
    </DialogTrigger>
  )
}

export const WithOverlay = () => {
  return (
    <DialogContainer isOpen>
      <Modal.Dialog overlay>
        <button>button</button>
      </Modal.Dialog>
    </DialogContainer>
  )
}

export const Scrollable = () => {
  return (
    <DialogContainer isOpen>
      <Modal.Dialog>
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
    </DialogContainer>
  )
}

export const InitialFocus = () => {
  const initialFocusRef = useRef<any>()
  return (
    <DialogContainer isOpen>
      <Modal.Dialog content={{ initialFocusRef }}>
        <button>not me</button>
        <button ref={initialFocusRef}>me</button>
        <button>not me</button>
      </Modal.Dialog>
    </DialogContainer>
  )
}

export const WithMenu = () => {
  return (
    <DialogContainer isOpen>
      <Modal.Dialog>
        <DialogTrigger
          trigger={({ ref, open }) => (
            <button ref={ref} onClick={open}>
              menu
            </button>
          )}
        >
          <Menu>
            {fruits.map((f) => (
              <Item key={f}>{f}</Item>
            ))}
          </Menu>
        </DialogTrigger>
      </Modal.Dialog>
    </DialogContainer>
  )
}

export const Nested = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <DialogContainer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Dialog overlay>
          <Nested />
          <DialogCloseButton />
        </Modal.Dialog>
      </DialogContainer>
    </>
  )
}
