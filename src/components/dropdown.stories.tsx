import { useState } from 'react'
import * as Menu from './menu'

export default {
  title: 'Dropdown',
}

export const Default = () => {
  const [value, setValue] = useState<string | null>(null)
  return (
    <div>
      <Menu.Menu
        trigger={({ anchorRef, open }) => (
          <button ref={anchorRef} onClick={open}>
            {value || 'open'}
          </button>
        )}
      >
        <Menu.List>
          <Menu.Item onClick={() => setValue('1')}>item 1</Menu.Item>
          <Menu.Item onClick={() => setValue('2')}>item 2</Menu.Item>
          <Menu.Item onClick={() => setValue('3')}>item 3</Menu.Item>
          <Menu.Submenu
            trigger={({ anchorRef, menuIdx, open }) => (
              <Menu.Item ref={anchorRef} menuIdx={menuIdx} onClick={open}>
                open
              </Menu.Item>
            )}
          >
            <Menu.List>
              <Menu.Item onClick={() => setValue('1')}>item 1</Menu.Item>
              <Menu.Item onClick={() => setValue('2')}>item 2</Menu.Item>
              <Menu.Item onClick={() => setValue('3')}>item 3</Menu.Item>
              <Menu.Item onClick={() => setValue('4')}>item 4</Menu.Item>
              <Menu.Item onClick={() => setValue('5')}>item 5</Menu.Item>
              <Menu.Submenu
                trigger={({ anchorRef, menuIdx, open }) => (
                  <Menu.Item ref={anchorRef} menuIdx={menuIdx} onClick={open}>
                    open
                  </Menu.Item>
                )}
              >
                <Menu.List>
                  <Menu.Item onClick={() => setValue('1')}>item 1</Menu.Item>
                  <Menu.FocusableItem>
                    {({ focusableRef, handleKeyDown }) => (
                      <input ref={focusableRef} onKeyDown={handleKeyDown} />
                    )}
                  </Menu.FocusableItem>
                  <Menu.Item onClick={() => setValue('2')}>item 2</Menu.Item>
                  <Menu.Item onClick={() => setValue('3')}>item 3</Menu.Item>
                  <Menu.FocusableItem>
                    {({ focusableRef, handleKeyDown }) => (
                      <input ref={focusableRef} onKeyDown={handleKeyDown} />
                    )}
                  </Menu.FocusableItem>
                </Menu.List>
              </Menu.Submenu>
            </Menu.List>
          </Menu.Submenu>
        </Menu.List>
      </Menu.Menu>
    </div>
  )
}
