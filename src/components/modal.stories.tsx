import { useState, useRef } from 'react'
import { Modal } from './modal'
import { Menu } from './menu'
import { ListBoxItem } from './listbox'
import { Lorem } from './lorem'
import { fruits } from '../util/fruits'

export default {
  title: 'Modal',
}

export const Default = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <button>a button</button>
      </Modal>
    </>
  )
}

export const Scrollable = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <button>a button</button>
        <Lorem paragraphs={10} />
      </Modal>
    </>
  )
}

export const InitialFocus = () => {
  const [isOpen, setIsOpen] = useState(false)
  const initialFocusRef = useRef<any>()
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={{ initialFocusRef }}
      >
        <button>not me</button>
        <button ref={initialFocusRef}>me</button>
        <button onClick={() => setIsOpen(false)}>close</button>
      </Modal>
    </>
  )
}

export const WithMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Menu>
          {fruits.map((f) => (
            <ListBoxItem key={f}>{f}</ListBoxItem>
          ))}
        </Menu>
      </Modal>
    </>
  )
}

export const Nested = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Nested />
      </Modal>
    </>
  )
}
