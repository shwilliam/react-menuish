import { Tooltip } from './tooltip'

export default {
  title: 'Alt/Tooltip',
}

export const Default = () => {
  return (
    <>
      <Tooltip
        trigger={({ anchorRef, hoverProps }) => (
          <button ref={anchorRef} {...hoverProps}>
            hover me
          </button>
        )}
      >
        peekaboo
      </Tooltip>
      <Tooltip
        trigger={({ anchorRef, hoverProps }) => (
          <button ref={anchorRef} {...hoverProps}>
            hover me
          </button>
        )}
      >
        peekaboo
      </Tooltip>
      <Tooltip
        trigger={({ anchorRef, hoverProps }) => (
          <button ref={anchorRef} {...hoverProps}>
            hover me
          </button>
        )}
      >
        peekaboo
      </Tooltip>
    </>
  )
}
