import { useRef, forwardRef, useState } from 'react'
import * as Menu from './menu'
import { mergeRefs } from '../util/merge-refs'
import { fruits } from '../util/fruits'

export default {
  title: 'Combobox',
}

const ComboboxInput = forwardRef(({ buttonProps, ...props }: any, ref) => {
  return (
    <>
      <input ref={ref} {...props} />
      <button {...buttonProps}>v</button>
    </>
  )
})

export const Default = () => {
  const [value, setValue] = useState<string | null>()
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<any>(null)
  const handleSetValue = (value: string | null) => {
    setValue(value)
    setInputValue(value || '')
  }
  const handleChangeInputValue = (value: string) => {
    setInputValue(value)
    if (!value) setValue(null)
  }
  return (
    <div>
      <Menu.Menu
        noFocusTrap
        trigger={({
          anchorRef,
          stickyTriggerRef,
          open,
          close,
          handleKeyDown,
        }) => (
          <ComboboxInput
            ref={mergeRefs(anchorRef, stickyTriggerRef, inputRef)}
            value={inputValue}
            onChange={(e) => handleChangeInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              setInputValue(value || '')
              close()
            }}
            buttonProps={{
              onClick: () => {
                open()
                inputRef.current.focus()
              },
            }}
          />
        )}
      >
        <Menu.List>
          {fruits
            .filter((fruit) => fruit.includes(inputValue.toLowerCase()))
            .map((fruit) => (
              <Menu.Item key={fruit} onClick={() => handleSetValue(fruit)}>
                {fruit}
              </Menu.Item>
            ))}
          <Menu.Submenu
            trigger={({ anchorRef, menuIdx, open }) => (
              <Menu.Item ref={anchorRef} menuIdx={menuIdx} onClick={open}>
                open
              </Menu.Item>
            )}
          >
            <Menu.List>
              <Menu.Item>item 1</Menu.Item>
              <Menu.Item>item 2</Menu.Item>
              <Menu.Item>item 3</Menu.Item>
            </Menu.List>
          </Menu.Submenu>
        </Menu.List>
      </Menu.Menu>
    </div>
  )
}
