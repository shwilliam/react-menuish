import { useRef, useState, useEffect } from 'react'
import { fruits, moreFruits } from '../../util/fruits'
import {
  ListBoxItemFocusable,
  ListBoxGroup,
  ListBoxItem,
  SubList,
} from './listbox'
import { Menu } from './menu'
import _ from 'lodash'
import { Tooltip } from './tooltip'

const fetchPokemon = async (
  url: string = 'https://pokeapi.co/api/v2/pokemon?limit=10',
) => {
  const res = await fetch(url)
  const resJson = await res.json()
  return { next: resJson.next, results: resJson.results }
}

const usePokemon = () => {
  const [pokemon, setPokemon] = useState<{ name: string }[]>([])
  const nextRef = useRef()
  const [loading, setLoading] = useState(false)
  const more = async () => {
    console.log('fetch more')
    setLoading(true)
    const { next, results } = await fetchPokemon(nextRef.current)
    setLoading(false)
    if (_.isArray(results)) setPokemon((s) => [...s, ...results])
    nextRef.current = next
  }

  return { pokemon, more, loading }
}

export default {
  title: 'Alt/Menu',
}

export const Default = () => {
  return (
    <Menu onChange={(value) => console.log(value)}>
      {fruits.map((fruit) => (
        <Tooltip
          popout={{ placement: 'right' }}
          trigger={({ anchorRef, hoverProps, ...props }) => (
            <ListBoxItem ref={anchorRef} {...hoverProps} {...props}>
              {fruit}
            </ListBoxItem>
          )}
        >
          more info about {fruit}
        </Tooltip>
      ))}
    </Menu>
  )
}

export const Async = () => {
  const { pokemon, more, loading } = usePokemon()

  useEffect(() => {
    more()
  }, [])

  return (
    <Menu onChange={(value) => console.log(value)} onLoadMore={more}>
      {pokemon.map((pokemon) => (
        <ListBoxItem>{pokemon.name}</ListBoxItem>
      ))}
      {loading ? <ListBoxItem isDisabled>loading</ListBoxItem> : null}
    </Menu>
  )
}

export const KeepOpen = () => {
  return (
    <Menu
      onChange={(value) => {
        console.log(value)
        return false
      }}
    >
      {fruits.map((fruit) => (
        <ListBoxItem>{fruit}</ListBoxItem>
      ))}
    </Menu>
  )
}

export const Picker = () => {
  const [value, setValue] = useState<number | string | null>(null)
  const activeOptionId = (!_.isNull(value) && String(value)) || undefined
  return (
    <Menu
      value={value}
      onChange={(value) => setValue(value)}
      activeOptionId={activeOptionId}
    >
      {fruits.map((fruit) => (
        <ListBoxItem id={fruit}>{fruit}</ListBoxItem>
      ))}
    </Menu>
  )
}

export const GroupedPicker = () => {
  const [value, setValue] = useState<number | string | null>(null)
  return (
    <Menu value={value} onChange={(value) => setValue(value)}>
      <ListBoxGroup label={<div>numbers</div>}>
        <ListBoxItem value={1}>one</ListBoxItem>
        <ListBoxItem value={2} isDisabled>
          two (disabled)
        </ListBoxItem>
        <ListBoxItem value={3}>three</ListBoxItem>
        <ListBoxItem value={4}>four</ListBoxItem>
      </ListBoxGroup>
      <ListBoxGroup label={<div>letters</div>}>
        <ListBoxItem>a</ListBoxItem>
        <ListBoxItem>b</ListBoxItem>
        <ListBoxItem>c</ListBoxItem>
        <ListBoxItem>d</ListBoxItem>
      </ListBoxGroup>
    </Menu>
  )
}

export const MultilevelPicker = () => {
  const [value, setValue] = useState<number | string | null>(null)
  return (
    <Menu value={value} onChange={(value) => setValue(value)}>
      {fruits.map((fruit) => (
        <ListBoxItem>{fruit}</ListBoxItem>
      ))}
      <SubList
        trigger={({ id, listIdx, anchorRef, onClick }) => (
          <ListBoxItem
            ref={anchorRef}
            id={id}
            listIdx={listIdx}
            onClick={onClick}
          >
            letters
          </ListBoxItem>
        )}
      >
        <ListBoxItem>a</ListBoxItem>
        <ListBoxItem>b</ListBoxItem>
        <ListBoxItem>c</ListBoxItem>
        <ListBoxItem>d</ListBoxItem>
      </SubList>
      <SubList
        trigger={({ id, listIdx, anchorRef, onClick }) => (
          <ListBoxItem
            ref={anchorRef}
            id={id}
            listIdx={listIdx}
            onClick={onClick}
          >
            more letters
          </ListBoxItem>
        )}
      >
        <ListBoxItem>e</ListBoxItem>
        <ListBoxItem>f</ListBoxItem>
        <ListBoxItem>g</ListBoxItem>
        <ListBoxItem>h</ListBoxItem>
      </SubList>
    </Menu>
  )
}

export const WithFilter = () => {
  const [filter, setFilter] = useState('')
  const [value, setValue] = useState<number | string | null>(null)
  return (
    <Menu
      value={value}
      onChange={(value) => setValue(value)}
      focusResetTrigger={filter}
    >
      <ListBoxItemFocusable>
        {({ focusableRef, handleKeyDown }) => (
          <input
            ref={focusableRef}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        )}
      </ListBoxItemFocusable>
      {fruits
        .filter((fruit) => fruit.includes(filter.toLowerCase()))
        .map((fruit) => (
          <ListBoxItem>{fruit}</ListBoxItem>
        ))}
      <SubList
        trigger={({ id, listIdx, anchorRef, onClick }) => (
          <ListBoxItem
            id={id}
            ref={anchorRef}
            listIdx={listIdx}
            onClick={onClick}
          >
            letters
          </ListBoxItem>
        )}
      >
        <ListBoxItem>a</ListBoxItem>
        <ListBoxItem>b</ListBoxItem>
        <ListBoxItem>c</ListBoxItem>
        <ListBoxItem>d</ListBoxItem>
      </SubList>
      {moreFruits
        .filter((fruit) => fruit.includes(filter.toLowerCase()))
        .map((fruit) => (
          <ListBoxItem>{fruit}</ListBoxItem>
        ))}
    </Menu>
  )
}

export const WithMultipleFilter = () => {
  const [filter, setFilter] = useState('')
  const [filter2, setFilter2] = useState('')
  const [value, setValue] = useState<number | string | null>(null)
  const filteredFruits2 = fruits.filter((fruit) =>
    fruit.includes(filter2.toLowerCase()),
  )
  return (
    <Menu value={value} onChange={(value) => setValue(value)}>
      <ListBoxItem>fixed fruit 1</ListBoxItem>
      <ListBoxItem>fixed fruit 2</ListBoxItem>
      <ListBoxItemFocusable>
        {({ focusableRef, handleKeyDown }) => (
          <input
            ref={focusableRef}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        )}
      </ListBoxItemFocusable>
      {fruits
        .filter((fruit) => fruit.includes(filter.toLowerCase()))
        .map((fruit) => (
          <ListBoxItem>{fruit}</ListBoxItem>
        ))}
      <SubList
        trigger={({ id, listIdx, anchorRef, onClick }) => (
          <ListBoxItem
            ref={anchorRef}
            id={id}
            listIdx={listIdx}
            onClick={onClick}
          >
            fruits again
          </ListBoxItem>
        )}
      >
        <ListBoxItem>fixed fruit 1</ListBoxItem>
        <ListBoxItem>fixed fruit 2</ListBoxItem>
        <ListBoxItemFocusable>
          {({ focusableRef, handleKeyDown }) => (
            <input
              ref={focusableRef}
              value={filter2}
              onChange={(e) => setFilter2(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}
        </ListBoxItemFocusable>
        {filteredFruits2.length ? (
          filteredFruits2.map((fruit) => <ListBoxItem>{fruit}</ListBoxItem>)
        ) : (
          <ListBoxItem>no results</ListBoxItem>
        )}
      </SubList>
    </Menu>
  )
}
