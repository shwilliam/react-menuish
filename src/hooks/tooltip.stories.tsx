import { useTooltip } from './tooltip'

export default {
  title: 'useTooltip',
}

export const Default = () => {
  const { hoverProps, isOpen } = useTooltip({})

  return (
    <>
      <button {...hoverProps}>hover me</button>
      {isOpen ? 'peekaboo' : null}
    </>
  )
}
