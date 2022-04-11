import { useState } from 'react'
import { useHover } from './hover'

export default {
  title: 'useHover',
}

export const Default = () => {
  const { hoverProps, isHovered } = useHover({
    onHoverStart: () => console.log('hover start'),
    onHoverEnd: () => console.log('hover end'),
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
    onHoverStart: () => console.log('hover start'),
    onHoverEnd: () => console.log('hover end'),
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
