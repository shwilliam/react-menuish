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
import { Tray } from './tray'
import { useIsMobile } from '../hooks/is-mobile'
import { useId } from '../hooks/id'

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
    const { state } = useListBoxState({
      onChange,
      focusResetTrigger: inputValue,
    })
    const {
      focus,
      setFocus,
      triggerAction,
      close,
      focusNext,
      focusPrev,
      closeLevel,
    } = state
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
          close()
          handled = true
          break
        default:
          break
      }

      if (handled) {
        console.log('prevent default')
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
      close()
    }

    const isOpen = !!focus.length
    const isMobile = useIsMobile()

    useEffect(() => {
      onInputChange?.((value && String(value)) || '')
    }, [value, onInputChange])

    const listBoxId = useId()
    const listbox = <ListBoxBase id={listBoxId} state={state} {...props} />
    const inputTriggerRef = useRef<any>()
    const focusInputTrigger = () => inputTriggerRef.current?.focus?.()

    if (isMobile)
      return (
        <>
          <button onClick={() => setFocus([0])}>{value || 'open'}</button>
          <Tray
            isOpen={isOpen}
            onOpen={focusInputTrigger}
            onClose={() => setFocus([])}
            content={{
              header: (
                <input
                  ref={inputTriggerRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  type="search"
                  aria-controls={listBoxId}
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
        content={{ isolateDialog: false }}
        trigger={({ ref, ...props }) => (
          <span>
            <input
              {...props}
              ref={ref}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={listBoxId}
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
            />
            <button
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              onClick={() => {
                setFocus([0])
                ref?.current?.focus?.()
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
