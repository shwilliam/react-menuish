import { useState } from 'react'
import { action } from '@storybook/addon-actions'
import { useHover } from './hover'

export default {
  title: 'useHover',
}

export const Default = () => {
  const { hoverProps, isHovered } = useHover({
    onHoverStart: action('hover start'),
    onHoverEnd: action('hover end'),
  })

  return (
    <>
      <div>{isHovered ? 'hovered' : 'not hovered'}</div>
      <button {...hoverProps}>hover me</button>
    </>
  )
}

export const Disableable = () => {
  const [isDisabled, setIsDisabled] = useState(false)
  const { hoverProps, isHovered } = useHover({
    isDisabled,
    onHoverStart: action('hover start'),
    onHoverEnd: action('hover end'),
  })

  return (
    <>
      <div>{isHovered ? 'hovered' : 'not hovered'}</div>
      <button {...hoverProps} onClick={() => setIsDisabled((s) => !s)}>
        hover me{isDisabled ? '(disabled)' : null}
      </button>
    </>
  )
}
