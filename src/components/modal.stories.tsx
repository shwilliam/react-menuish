import { useState, useRef } from 'react'
import { Modal, ModalContent } from './modal'
import { Lorem } from './lorem'

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
