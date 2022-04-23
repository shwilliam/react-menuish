import { useState } from 'react'
import {
  ListBoxItemFocusable,
  ListBox,
  ListBoxGroup,
  ListBoxItem,
} from './listbox'
import { fruits } from '../util/fruits'

export default {
  title: 'ListBox',
}

export const Default = () => {
  return (
    <ListBox>
      {fruits.map((fruit) => (
        <ListBoxItem key={fruit}>{fruit}</ListBoxItem>
      ))}
    </ListBox>
  )
}

export const Grouped = () => {
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
        <ListBoxItemFocusable isVirtuallyFocusable={false}>
          {({ focusableRef }) => (
            <input
              ref={focusableRef}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
