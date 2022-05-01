import { useState } from 'react'
import { FocusableItem, ListBox, Group, Item } from './listbox'
import { fruits } from '../util/fruits'

export default {
  title: 'ListBox',
}

export const Default = () => {
  return (
    <ListBox>
      {fruits.map((fruit) => (
        <Item key={fruit}>{fruit}</Item>
      ))}
    </ListBox>
  )
}

export const Grouped = () => {
  return (
    <ListBox>
      <Group label={<div>numbers</div>}>
        <Item>one</Item>
        <Item isDisabled>two (disabled)</Item>
        <Item>three</Item>
        <Item>four</Item>
      </Group>
      <Group label={<div>letters</div>}>
        <Item>a</Item>
        <Item>b</Item>
        <Item>c</Item>
        <Item>d</Item>
      </Group>
    </ListBox>
  )
}

export const WithFilter = () => {
  const [filter, setFilter] = useState('')
  return (
    <ListBox>
      <Group label={<div>numbers</div>}>
        <Item>one</Item>
        <Item isDisabled>two (disabled)</Item>
        <Item>three</Item>
        <Item>four</Item>
      </Group>
      <Group label={<div>fruits</div>}>
        <FocusableItem isVirtuallyFocusable={false}>
          {({ focusableRef }) => (
            <input
              ref={focusableRef}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          )}
        </FocusableItem>
        {fruits
          .filter((fruit) => fruit.includes(filter.toLowerCase()))
          .map((fruit) => (
            <Item key={fruit}>{fruit}</Item>
          ))}
      </Group>
    </ListBox>
  )
}
