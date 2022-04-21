import { useState } from 'react'
import { fruits, moreFruits } from '../util/fruits'
import { ListBoxGroup, ListBoxItem, SubList } from './listbox'
import { Combobox } from './combobox'

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
      onChange={(value) => setValue(value)}
      inputValue={inputValue}
      onInputChange={setInputValue}
    >
      {filteredFruits.map((fruit, idx) => (
        <ListBoxItem>{fruit}</ListBoxItem>
      ))}
      <SubList
        trigger={(props) => <ListBoxItem {...props}>more fruits</ListBoxItem>}
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
      onChange={(value) => setValue(value)}
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
      <ListBoxGroup label={<div>fruits</div>}>
        {filteredFruits.length ? (
          filteredFruits.map((fruit, idx) => <ListBoxItem>{fruit}</ListBoxItem>)
        ) : (
          <ListBoxItem isDisabled>no results</ListBoxItem>
        )}
      </ListBoxGroup>
      <ListBoxGroup label={<div>more fruits</div>}>
        {moreFilteredFruits.length ? (
          moreFilteredFruits.map((fruit, idx) => (
            <ListBoxItem>{fruit}</ListBoxItem>
          ))
        ) : (
          <ListBoxItem isDisabled>no results</ListBoxItem>
        )}
      </ListBoxGroup>
    </Combobox>
  )
}
