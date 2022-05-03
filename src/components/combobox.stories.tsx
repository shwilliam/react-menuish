import { useState } from 'react'
import { fruits, moreFruits } from '../util/fruits'
import { Group, Item } from './listbox'
import { Combobox } from './combobox'
import { LoremWrap } from './lorem'
import { Menu } from './menu'

export default {
  title: 'Combobox',
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
      onChange={(value) => setValue(value)}
      inputValue={inputValue}
      onInputChange={setInputValue}
    >
      {filteredFruits.length ? (
        filteredFruits.map((fruit, idx) => <Item key={fruit}>{fruit}</Item>)
      ) : (
        <Item>no results</Item>
      )}
    </Combobox>
  )
}

export const InScollArea = () => (
  <LoremWrap>
    <Default />
  </LoremWrap>
)

export const MultiLevel = () => {
  const [inputValue, setInputValue] = useState('')
  const [value, setValue] = useState<string | null>()
  const filteredFruits = fruits.filter((fruit) =>
    fruit.includes(inputValue.toLowerCase()),
  )
  return (
    <Combobox
      value={value}
      onChange={(value) => setValue(value)}
      inputValue={inputValue}
      onInputChange={setInputValue}
    >
      {filteredFruits.map((fruit, idx) => (
        <Item key={fruit}>{fruit}</Item>
      ))}
      <Menu trigger={(props) => <Item {...props}>more fruits</Item>}>
        {moreFruits.map((fruit) => (
          <Item key={fruit}>{fruit}</Item>
        ))}
      </Menu>
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
      onChange={(value) => setValue(value)}
      inputValue={inputValue}
      onInputChange={setInputValue}
    >
      {filteredFruits.length ? (
        filteredFruits.map((fruit, idx) => (
          <Item value={idx} key={fruit}>
            {fruit}
          </Item>
        ))
      ) : (
        <Item>no results</Item>
      )}
    </Combobox>
  )
}

export const Grouped = () => {
  const [inputValue, setInputValue] = useState('')
  const [value, setValue] = useState<string | null>()
  const filteredFruits = fruits.filter((fruit) =>
    fruit.includes(inputValue.toLowerCase()),
  )
  const moreFilteredFruits = moreFruits.filter((fruit) =>
    fruit.includes(inputValue.toLowerCase()),
  )

  return (
    <Combobox
      value={value}
      onChange={(value) => setValue(value)}
      inputValue={inputValue}
      onInputChange={setInputValue}
    >
      <Group label={<div>fruits</div>}>
        {filteredFruits.length ? (
          filteredFruits.map((fruit) => <Item key={fruit}>{fruit}</Item>)
        ) : (
          <Item isDisabled>no results</Item>
        )}
      </Group>
      <Group label={<div>more fruits</div>}>
        {moreFilteredFruits.length ? (
          moreFilteredFruits.map((fruit, idx) => (
            <Item key={fruit}>{fruit}</Item>
          ))
        ) : (
          <Item isDisabled>no results</Item>
        )}
      </Group>
    </Combobox>
  )
}
