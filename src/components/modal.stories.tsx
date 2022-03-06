import { useState, useRef } from 'react'
import { Modal, ModalContent } from './modal'
import * as Menu from './menu'
import { Lorem } from './lorem'
import { fruits } from '../util/fruits'

export default {
  title: 'Modal',
}

export const Default = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen}>
        <ModalContent onClose={() => setIsOpen(false)}>
          <Lorem />
        </ModalContent>
      </Modal>
    </div>
  )
}

export const Scrollable = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen}>
        <ModalContent onClose={() => setIsOpen(false)}>
          <Lorem paragraphs={5} />
        </ModalContent>
      </Modal>
    </div>
  )
}

export const InitialFocus = () => {
  const [isOpen, setIsOpen] = useState(false)
  const initialFocusRef = useRef<any>()
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen}>
        <ModalContent
          initialFocusRef={initialFocusRef}
          onClose={() => setIsOpen(false)}
        >
          <button>not me</button>
          <button ref={initialFocusRef}>me</button>
          <button onClick={() => setIsOpen(false)}>close</button>
        </ModalContent>
      </Modal>
    </div>
  )
}

export const WithMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen}>
        <ModalContent onClose={() => setIsOpen(false)}>
          <Menu.Menu
            trigger={({ anchorRef, open }) => (
              <button ref={anchorRef} onClick={open}>
                open
              </button>
            )}
          >
            <Menu.List>
              {fruits.map((f) => (
                <Menu.Item key={f}>{f}</Menu.Item>
              ))}
            </Menu.List>
          </Menu.Menu>
        </ModalContent>
      </Modal>
    </div>
  )
}

export const Nested = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen}>
        <ModalContent onClose={() => setIsOpen(false)}>
          <Nested />
        </ModalContent>
      </Modal>
    </div>
  )
}
