import { useRef, forwardRef, useState } from 'react'
import { mergeRefs } from '../../util/merge-refs'
import { fruits, moreFruits } from '../../util/fruits'
import {
  ListBoxItemFocusable,
  ListBox,
  ListBoxGroup,
  ListBoxItem,
  SubList,
} from './listbox'
import { Menu } from './menu'
import { Combobox } from './combobox'

export default {
  title: 'Alt/Combobox',
}

export const Default = () => {
  const [inputValue, setInputValue] = useState('')
  const [value, setValue] = useState<string | null>()
  const filteredFruits = moreFruits.filter((fruit) =>
    fruit.includes(inputValue.toLowerCase()),
  )
  return (
    <Combobox
      value={value}
      onChange={(value) => {
        console.log('onChange: ', value)
        setValue(value)
      }}
      inputValue={inputValue}
      onInputChange={setInputValue}
    >
      {filteredFruits.length ? (
        filteredFruits.map((fruit, idx) => (
          <ListBoxItem key={fruit}>{fruit}</ListBoxItem>
        ))
      ) : (
        <ListBoxItem>no results</ListBoxItem>
      )}
    </Combobox>
  )
}

export const MultiLevel = () => {
  const [inputValue, setInputValue] = useState('')
  const [value, setValue] = useState<string | null>()
  const filteredFruits = fruits.filter((fruit) =>
    fruit.includes(inputValue.toLowerCase()),
  )
  return (
    <Combobox
      value={value}
      onChange={(value) => {
        console.log('onChange: ', value)
        setValue(value)
      }}
      inputValue={inputValue}
      onInputChange={setInputValue}
    >
      {filteredFruits.map((fruit, idx) => (
        <ListBoxItem>{fruit}</ListBoxItem>
      ))}
      <SubList
        trigger={({ listIdx, anchorRef, onClick }) => (
          <ListBoxItem ref={anchorRef} listIdx={listIdx} onClick={onClick}>
            more fruits
          </ListBoxItem>
        )}
      >
        {moreFruits.map((fruit) => (
          <ListBoxItem key={fruit}>{fruit}</ListBoxItem>
        ))}
      </SubList>
    </Combobox>
  )
}

export const AltValue = () => {
  const [inputValue, setInputValue] = useState('')
  const [value, setValue] = useState<string | null>()
  const filteredFruits = moreFruits.filter((fruit) =>
    fruit.includes(inputValue.toLowerCase()),
  )
  return (
    <Combobox
      value={value}
      onChange={(value) => {
        console.log('onChange: ', value)
        setValue(value)
      }}
      inputValue={inputValue}
      onInputChange={setInputValue}
    >
      {filteredFruits.length ? (
        filteredFruits.map((fruit, idx) => (
          <ListBoxItem value={idx}>{fruit}</ListBoxItem>
        ))
      ) : (
        <ListBoxItem>no results</ListBoxItem>
      )}
    </Combobox>
  )
}

// export const KeepOpen = () => {
//   return (
//     <Menu
//       onChange={(value) => {
//         console.log(value)
//         return false
//       }}
//     >
//       {fruits.map((fruit) => (
//         <ListBoxItem>{fruit}</ListBoxItem>
//       ))}
//     </Menu>
//   )
// }

// export const Picker = () => {
//   const [value, setValue] = useState<number | string | null>(null)
//   return (
//     <Menu value={value} onChange={(value) => setValue(value)}>
//       {fruits.map((fruit) => (
//         <ListBoxItem>{fruit}</ListBoxItem>
//       ))}
//     </Menu>
//   )
// }

// export const GroupedPicker = () => {
//   const [value, setValue] = useState<number | string | null>(null)
//   return (
//     <Menu value={value} onChange={(value) => setValue(value)}>
//       <ListBoxGroup label={<div>numbers</div>}>
//         <ListBoxItem value={1}>one</ListBoxItem>
//         <ListBoxItem value={2} isDisabled>
//           two (disabled)
//         </ListBoxItem>
//         <ListBoxItem value={3}>three</ListBoxItem>
//         <ListBoxItem value={4}>four</ListBoxItem>
//       </ListBoxGroup>
//       <ListBoxGroup label={<div>letters</div>}>
//         <ListBoxItem>a</ListBoxItem>
//         <ListBoxItem>b</ListBoxItem>
//         <ListBoxItem>c</ListBoxItem>
//         <ListBoxItem>d</ListBoxItem>
//       </ListBoxGroup>
//     </Menu>
//   )
// }

// export const MultilevelPicker = () => {
//   const [value, setValue] = useState<number | string | null>(null)
//   return (
//     <Menu value={value} onChange={(value) => setValue(value)}>
//       {fruits.map((fruit) => (
//         <ListBoxItem>{fruit}</ListBoxItem>
//       ))}
//       <SubList
//         trigger={({ listIdx, anchorRef, onAction, onClick }) => (
//           <ListBoxItem
//             ref={anchorRef}
//             listIdx={listIdx}
//             onAction={onAction}
//             onClick={onClick}
//           >
//             letters
//           </ListBoxItem>
//         )}
//       >
//         <ListBoxItem>a</ListBoxItem>
//         <ListBoxItem>b</ListBoxItem>
//         <ListBoxItem>c</ListBoxItem>
//         <ListBoxItem>d</ListBoxItem>
//       </SubList>
//     </Menu>
//   )
// }

// export const WithFilter = () => {
//   const [filter, setFilter] = useState('')
//   const [value, setValue] = useState<number | string | null>(null)
//   return (
//     <Menu value={value} onChange={(value) => setValue(value)}>
//       <ListBoxItemFocusable>
//         {({ focusableRef, handleKeyDown }) => (
//           <input
//             ref={focusableRef}
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             onKeyDown={handleKeyDown}
//           />
//         )}
//       </ListBoxItemFocusable>
//       {fruits
//         .filter((fruit) => fruit.includes(filter.toLowerCase()))
//         .map((fruit) => (
//           <ListBoxItem>{fruit}</ListBoxItem>
//         ))}
//       <SubList
//         trigger={({ listIdx, anchorRef, onAction, onClick }) => (
//           <ListBoxItem
//             ref={anchorRef}
//             listIdx={listIdx}
//             onAction={onAction}
//             onClick={onClick}
//           >
//             letters
//           </ListBoxItem>
//         )}
//       >
//         <ListBoxItem>a</ListBoxItem>
//         <ListBoxItem>b</ListBoxItem>
//         <ListBoxItem>c</ListBoxItem>
//         <ListBoxItem>d</ListBoxItem>
//       </SubList>
//     </Menu>
//   )
// }

// export const WithMultipleFilter = () => {
//   const [filter, setFilter] = useState('')
//   const [filter2, setFilter2] = useState('')
//   const [value, setValue] = useState<number | string | null>(null)
//   const filteredFruits2 = fruits.filter((fruit) =>
//     fruit.includes(filter2.toLowerCase()),
//   )
//   return (
//     <Menu value={value} onChange={(value) => setValue(value)}>
//       <ListBoxItem>fixed fruit 1</ListBoxItem>
//       <ListBoxItem>fixed fruit 2</ListBoxItem>
//       <ListBoxItemFocusable>
//         {({ focusableRef, handleKeyDown }) => (
//           <input
//             ref={focusableRef}
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             onKeyDown={handleKeyDown}
//           />
//         )}
//       </ListBoxItemFocusable>
//       {fruits
//         .filter((fruit) => fruit.includes(filter.toLowerCase()))
//         .map((fruit) => (
//           <ListBoxItem>{fruit}</ListBoxItem>
//         ))}
//       <SubList
//         trigger={({ listIdx, anchorRef, onAction, onClick }) => (
//           <ListBoxItem
//             ref={anchorRef}
//             listIdx={listIdx}
//             onAction={onAction}
//             onClick={onClick}
//           >
//             fruits again
//           </ListBoxItem>
//         )}
//       >
//         <ListBoxItem>fixed fruit 1</ListBoxItem>
//         <ListBoxItem>fixed fruit 2</ListBoxItem>
//         <ListBoxItemFocusable>
//           {({ focusableRef, handleKeyDown }) => (
//             <input
//               ref={focusableRef}
//               value={filter2}
//               onChange={(e) => setFilter2(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//           )}
//         </ListBoxItemFocusable>
//         {filteredFruits2.length ? (
//           filteredFruits2.map((fruit) => <ListBoxItem>{fruit}</ListBoxItem>)
//         ) : (
//           <ListBoxItem>no results</ListBoxItem>
//         )}
//       </SubList>
//     </Menu>
//   )
// }
