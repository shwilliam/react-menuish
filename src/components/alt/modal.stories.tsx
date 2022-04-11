import { useState, useRef } from 'react'
import { Modal } from './modal'
// import * as Menu from './menu'
import { Lorem } from '../lorem'
import { fruits } from '../../util/fruits'

export default {
  title: 'Alt/Modal',
}

export const Default = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Lorem />
      </Modal>
    </div>
  )
}

export const Scrollable = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Lorem paragraphs={5} />
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
      {/* <ModalContent initialFocusRef={initialFocusRef}> */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <button>not me</button>
        <button ref={initialFocusRef}>me</button>
        <button onClick={() => setIsOpen(false)}>close</button>
      </Modal>
    </div>
  )
}

// export const WithMenu = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   return (
//     <div>
//       <button onClick={() => setIsOpen(true)}>open</button>
//       <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
//         <ModalContent>
//           <Menu.Menu
//             trigger={({ anchorRef, open }) => (
//               <button ref={anchorRef} onClick={open}>
//                 open
//               </button>
//             )}
//           >
//             <Menu.List>
//               {fruits.map((f) => (
//                 <Menu.Item key={f}>{f}</Menu.Item>
//               ))}
//             </Menu.List>
//           </Menu.Menu>
//         </ModalContent>
//       </Modal>
//     </div>
//   )
// }

export const Nested = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>open</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Nested />
      </Modal>
    </div>
  )
}
