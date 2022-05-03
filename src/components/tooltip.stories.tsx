import { Tooltip } from './tooltip'

export default {
  title: 'Tooltip',
}

const BasicTooltip = () => (
  <Tooltip trigger={(props) => <button {...props}>hover me</button>}>
    peekaboo
  </Tooltip>
)

export const Default = () => {
  return (
    <>
      <BasicTooltip />
      <BasicTooltip />
      <BasicTooltip />
    </>
  )
}

const FocusableTooltip = () => (
  <Tooltip
    trigger={({ onVirtualFocusStart, onVirtualFocusEnd, ...props }) => (
      <button
        {...props}
        onFocus={onVirtualFocusStart}
        onBlur={onVirtualFocusEnd}
      >
        focus or hover me
      </button>
    )}
  >
    peekaboo
  </Tooltip>
)

export const FocusTrigger = () => {
  return (
    <>
      <FocusableTooltip />
      <FocusableTooltip />
      <FocusableTooltip />
    </>
  )
}

export const TriggerWithAltAction = () => {
  return (
    <Tooltip
      trigger={(props) => (
        <button {...props} onClick={() => alert('yeet')}>
          hover me
        </button>
      )}
    >
      peekaboo
    </Tooltip>
  )
}
