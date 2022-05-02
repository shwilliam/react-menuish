import { useRef } from 'react'
import * as Modal from './modal'
import { Menu } from './menu'
import { Item } from './listbox'
import { Lorem } from './lorem'
import { ModalVariant } from './dialog-variant'
import { fruits } from '../util/fruits'

export default {
  title: 'Modal',
}

export const Default = () => {
  return (
    <ModalVariant
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <button>a button</button>
    </ModalVariant>
  )
}

export const Scrollable = () => {
  return (
    <ModalVariant
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Modal.Header>
        <Modal.Title>
          a very looooooooooong title that prolly gonnna have to wrap
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <button>a button</button>
        <Lorem paragraphs={10} />
      </Modal.Body>
    </ModalVariant>
  )
}

export const InitialFocus = () => {
  const initialFocusRef = useRef<any>()
  return (
    <ModalVariant
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
      dialog={{ initialFocusRef }}
    >
      <button>not me</button>
      <button ref={initialFocusRef}>me</button>
    </ModalVariant>
  )
}

export const WithMenu = () => {
  return (
    <ModalVariant
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Menu>
        {fruits.map((f) => (
          <Item key={f}>{f}</Item>
        ))}
      </Menu>
    </ModalVariant>
  )
}

export const Nested = () => {
  return (
    <ModalVariant
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Nested />
    </ModalVariant>
  )
}
