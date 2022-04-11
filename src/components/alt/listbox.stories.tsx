import { useRef, forwardRef, useState } from 'react'
import { mergeRefs } from '../../util/merge-refs'
import { fruits } from '../../util/fruits'
import {
  ListBoxItemFocusable,
  ListBox,
  ListBoxGroup,
  ListBoxItem,
} from './listbox'

export default {
  title: 'Alt/ListBox',
}

export const Default = () => {
  return (
    <ListBox>
      <ListBoxGroup label={<div>numbers</div>}>
        <ListBoxItem>one</ListBoxItem>
        <ListBoxItem isDisabled>two (disabled)</ListBoxItem>
        <ListBoxItem>three</ListBoxItem>
        <ListBoxItem>four</ListBoxItem>
      </ListBoxGroup>
      <ListBoxGroup label={<div>letters</div>}>
        <ListBoxItem>a</ListBoxItem>
        <ListBoxItem>b</ListBoxItem>
        <ListBoxItem>c</ListBoxItem>
        <ListBoxItem>d</ListBoxItem>
      </ListBoxGroup>
    </ListBox>
  )
}

export const WithFilter = () => {
  const [filter, setFilter] = useState('')
  return (
    <ListBox>
      <ListBoxGroup label={<div>numbers</div>}>
        <ListBoxItem>one</ListBoxItem>
        <ListBoxItem isDisabled>two (disabled)</ListBoxItem>
        <ListBoxItem>three</ListBoxItem>
        <ListBoxItem>four</ListBoxItem>
      </ListBoxGroup>
      <ListBoxGroup label={<div>fruits</div>}>
        <ListBoxItemFocusable>
          {({
            focusableRef,
            //  handleKeyDown
          }) => (
            <input
              ref={focusableRef}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              // onKeyDown={handleKeyDown}
            />
          )}
        </ListBoxItemFocusable>
        {fruits
          .filter((fruit) => fruit.includes(filter.toLowerCase()))
          .map((fruit) => (
            <ListBoxItem key={fruit}>{fruit}</ListBoxItem>
          ))}
      </ListBoxGroup>
    </ListBox>
  )
}
