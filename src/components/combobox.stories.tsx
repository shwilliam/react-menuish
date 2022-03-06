import { useRef, forwardRef } from 'react'
import * as Menu from './menu'
import { mergeRefs } from '../util/merge-refs'

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
  const inputRef = useRef<any>(null)
  return (
    <div>
      <Menu.Menu
        noFocusTrap
        trigger={({ anchorRef, stickyTriggerRef, open, handleKeyDown }) => (
          <ComboboxInput
            ref={mergeRefs(anchorRef, stickyTriggerRef, inputRef)}
            onKeyDown={handleKeyDown}
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
          <Menu.Item>item 1</Menu.Item>
          <Menu.Item>item 2</Menu.Item>
          <Menu.Item>item 3</Menu.Item>
          <Menu.Submenu
            trigger={({ anchorRef, menuIdx, open }) => (
              <Menu.Item ref={anchorRef} menuIdx={menuIdx} onClick={open}>
                open
              </Menu.Item>
            )}
          >
            <Menu.List>
              <Menu.Item>item 1</Menu.Item>
              <Menu.FocusableItem>
                {({ focusableRef, handleKeyDown }) => (
                  <input ref={focusableRef} onKeyDown={handleKeyDown} />
                )}
              </Menu.FocusableItem>
              <Menu.Item>item 2</Menu.Item>
              <Menu.Item>item 3</Menu.Item>
              <Menu.FocusableItem>
                {({ focusableRef, handleKeyDown }) => (
                  <input ref={focusableRef} onKeyDown={handleKeyDown} />
                )}
              </Menu.FocusableItem>
            </Menu.List>
          </Menu.Submenu>
        </Menu.List>
      </Menu.Menu>
    </div>
  )
}
