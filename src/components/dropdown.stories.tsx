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
          <Menu.DropdownItem onClick={() => setValue('1')}>
            item 1
          </Menu.DropdownItem>
          <Menu.DropdownItem onClick={() => setValue('2')}>
            item 2
          </Menu.DropdownItem>
          <Menu.DropdownItem onClick={() => setValue('3')}>
            item 3
          </Menu.DropdownItem>
          <Menu.Submenu
            trigger={({ anchorRef, menuIdx, open }) => (
              <Menu.Item ref={anchorRef} menuIdx={menuIdx} onClick={open}>
                open
              </Menu.Item>
            )}
          >
            <Menu.List>
              <Menu.DropdownItem onClick={() => setValue('1')}>
                item 1
              </Menu.DropdownItem>
              <Menu.DropdownItem onClick={() => setValue('2')}>
                item 2
              </Menu.DropdownItem>
              <Menu.DropdownItem onClick={() => setValue('3')}>
                item 3
              </Menu.DropdownItem>
              <Menu.DropdownItem onClick={() => setValue('4')}>
                item 4
              </Menu.DropdownItem>
              <Menu.DropdownItem onClick={() => setValue('5')}>
                item 5
              </Menu.DropdownItem>
              <Menu.Submenu
                trigger={({ anchorRef, menuIdx, open }) => (
                  <Menu.Item ref={anchorRef} menuIdx={menuIdx} onClick={open}>
                    open
                  </Menu.Item>
                )}
              >
                <Menu.List>
                  <Menu.DropdownItem onClick={() => setValue('1')}>
                    item 1
                  </Menu.DropdownItem>
                  <Menu.FocusableItem>
                    {({ focusableRef, handleKeyDown }) => (
                      <input ref={focusableRef} onKeyDown={handleKeyDown} />
                    )}
                  </Menu.FocusableItem>
                  <Menu.DropdownItem onClick={() => setValue('2')}>
                    item 2
                  </Menu.DropdownItem>
                  <Menu.DropdownItem onClick={() => setValue('3')}>
                    item 3
                  </Menu.DropdownItem>
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
