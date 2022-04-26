import { useState, useRef, MouseEventHandler } from 'react'
import { Popout } from './popout'
import { Lorem } from './lorem'
import {
  getListBoxKeyboardEventHandler,
  Item,
  ListBoxBase,
  useListBoxState,
} from './listbox'
import { fruits, moreFruits } from '../util/fruits'
import { DialogContainer, DialogTrigger, PopoverPosition } from './dialog'

export default {
  title: 'Popout',
}

export const Default = () => {
  return (
    <Popout
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Lorem paragraphs={5} />
    </Popout>
  )
}

export const Context = () => {
  const [position, setPosition] = useState<PopoverPosition>()
  const handleContextMenu: MouseEventHandler = (e) => {
    setPosition({ x: e.clientX, y: e.clientY })
    e.preventDefault()
  }

  return (
    <div
      style={{ height: '500px', border: '1px solid blue' }}
      onContextMenu={handleContextMenu}
    >
      right click me
      <Popout
        isOpen={!!position}
        onClose={() => setPosition(undefined)}
        position={position}
      >
        bla bla
      </Popout>
    </div>
  )
}

// export const WithListbox = () => {
//   const filterRef = useRef<any>()
//   const [isOpen, setIsOpen] = useState(false)

//   const { state } = useListBoxState({
//     onChange: () => false,
//     // onChange,
//     // focusResetTrigger: inputValue,
//   })
//   const {
//     focus,
//     setFocus,
//     triggerAction,
//     close,
//     focusNext,
//     focusPrev,
//     closeLevel,
//   } = state

//   // const handleInputChange: ChangeEventHandler = (e) => {
//   //   const value = e.target['value'] || ''
//   //   onInputChange?.(value)
//   //   if (!value) onChange?.(null)
//   //   if (!focus.length) setFocus([0])
//   // }
//   // const handleBlur = () => {
//   //   if (value) onInputChange?.((value && String(value)) || '')
//   //   close()
//   // }

//   // const isOpen = !!focus.length
//   // const isMobile = useIsMobile()

//   // useEffect(() => {
//   //   onInputChange?.((value && String(value)) || '')
//   // }, [value, onInputChange])

//   const [inputValue, setInputValue] = useState('')
//   const [virtuallyFocusedItem, setVirtuallyFocusedItem] =
//     useState<string | null>()
//   const filteredFruits = moreFruits.filter((fruit) =>
//     fruit.includes(inputValue.toLowerCase()),
//   )
//   const handleKeyDown = getListBoxKeyboardEventHandler({
//     state,
//     isFixed: true,
//   })

//   return (
//     <>
//       <Popout
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//         content={{ initialFocusRef: filterRef }}
//         trigger={(props) => (
//           <button {...props} onClick={() => setIsOpen(true)}>
//             open
//           </button>
//         )}
//       >
//         <div style={{ display: 'flex', width: '600px' }}>
//           <div style={{ width: '50%' }}>
//             <input
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <ListBoxBase state={state}>
//               {filteredFruits.length ? (
//                 filteredFruits.map((fruit) => (
//                   <Item
//                     key={fruit}
//                     onVirtualFocusStart={() => {
//                       setVirtuallyFocusedItem(fruit)
//                     }}
//                   >
//                     {fruit}
//                   </Item>
//                 ))
//               ) : (
//                 <Item>no results</Item>
//               )}
//             </ListBoxBase>
//           </div>
//           <div style={{ width: '50%' }}>stuff about {virtuallyFocusedItem}</div>
//         </div>
//       </Popout>
//       <Lorem paragraphs={50} />
//     </>
//   )
// }
