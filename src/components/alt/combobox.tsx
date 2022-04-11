import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  ChangeEventHandler,
  useEffect,
  useRef,
  KeyboardEventHandler,
} from 'react'
import { Popout } from './popout'
import { ChangeHandler, ListBoxBase, useListBoxState } from './listbox'
import { useIsMobile } from '../../hooks/is-mobile'
import { Tray } from './tray'

interface ComboboxProps {
  value?: string
  onChange?: ChangeHandler
  inputValue?: string
  onInputChange?: (value: string) => void
  children: ReactNode
}

export const Combobox = forwardRef(
  (
    { value, onChange, inputValue, onInputChange, ...props }: ComboboxProps,
    ref: ForwardedRef<any>,
  ) => {
    const { state } = useListBoxState({ onChange })
    const {
      focus,
      setFocus,
      triggerAction,
      resetFocus,
      focusNext,
      focusPrev,
      closeLevel,
    } = state
    const handleAction = (value?: string) => {
      const shouldClose = triggerAction(value)
      if (shouldClose !== false) resetFocus()
    }
    const handleKeyDown: KeyboardEventHandler = (e) => {
      let handled = false
      switch (e.key) {
        case 'ArrowDown':
          if (!focus.length) setFocus([0])
          else focusNext()
          handled = true
          break
        case 'ArrowUp':
          focusPrev()
          handled = true
          break
        case ' ':
        case 'Enter':
          if (focus.length) {
            triggerAction()
            handled = true
          }
          break
        case 'ArrowLeft':
        case 'ArrowRight':
          const target = e.currentTarget
          if (!target) break

          const direction = e.key === 'ArrowLeft' ? 'left' : 'right',
            { selectionStart, selectionEnd } = target,
            isSelectionAtEnd = selectionEnd === inputValue?.length,
            isSelectionAtStart = selectionStart === 0,
            selectionLength = (selectionEnd ?? 0) - (selectionStart ?? 0),
            isEndOfInput =
              !selectionLength &&
              ((direction === 'left' && isSelectionAtStart) ||
                (direction === 'right' && isSelectionAtEnd))

          if (isEndOfInput) {
            if (direction === 'right') triggerAction()
            else closeLevel(focus.length - 1)
            handled = true
          }
          break
        case 'Escape':
          resetFocus()
          handled = true
          break
        default:
          break
      }

      if (handled) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleInputChange: ChangeEventHandler = (e) => {
      const value = e.target['value'] || ''
      onInputChange?.(value)
      if (!value) onChange?.(null)
      if (!focus.length) setFocus([0])
    }
    const handleBlur = () => {
      if (value) onInputChange?.((value && String(value)) || '')
      resetFocus()
    }

    const isOpen = !!focus.length
    const isMobile = useIsMobile()

    useEffect(() => {
      onInputChange?.((value && String(value)) || '')
    }, [value, onInputChange])

    const listbox = (
      <ListBoxBase state={state} onAction={handleAction} {...props} />
    )

    const inputTriggerRef = useRef<any>()

    if (isMobile)
      return (
        <>
          <button onClick={() => setFocus([0])}>{value || 'open'}</button>
          <Tray
            isOpen={isOpen}
            onClose={() => setFocus([])}
            content={{
              header: (
                <input
                  ref={inputTriggerRef}
                  value={inputValue}
                  onChange={handleInputChange}
                />
              ),
            }}
          >
            {listbox}
          </Tray>
        </>
      )

    return (
      <Popout
        isOpen={isOpen}
        onClose={() => setFocus([])}
        trigger={({ anchorRef }) => (
          <span>
            <input
              ref={anchorRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
            <button
              onClick={() => {
                setFocus([0])
                anchorRef.current?.focus?.()
              }}
            >
              ⬇
            </button>
          </span>
        )}
      >
        {listbox}
      </Popout>
    )
  },
)
