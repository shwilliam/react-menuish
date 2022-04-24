import { useState, useRef } from 'react'
import * as Modal from './modal'
import { Menu } from './menu'
import { Item } from './listbox'
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
      <Modal.Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <button>a button</button>
      </Modal.Dialog>
    </>
  )
}

export const Scrollable = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal.Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header>
          <Modal.Title>
            a very looooooooooong title that prolly gonnna have to wrap
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <button>a button</button>
          <Lorem paragraphs={10} />
        </Modal.Body>
      </Modal.Dialog>
    </>
  )
}

export const InitialFocus = () => {
  const [isOpen, setIsOpen] = useState(false)
  const initialFocusRef = useRef<any>()
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal.Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={{ initialFocusRef }}
      >
        <button>not me</button>
        <button ref={initialFocusRef}>me</button>
        <button onClick={() => setIsOpen(false)}>close</button>
      </Modal.Dialog>
    </>
  )
}

export const WithMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal.Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Menu>
          {fruits.map((f) => (
            <Item key={f}>{f}</Item>
          ))}
        </Menu>
      </Modal.Dialog>
    </>
  )
}

export const Nested = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal.Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Nested />
      </Modal.Dialog>
    </>
  )
}
