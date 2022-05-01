import { AlertDialog } from './alert-dialog'
import { useId } from '../hooks/id'
import { DialogTrigger } from './dialog'

export default {
  title: 'Alert Dialog',
  parameters: {
    docs: {
      description: {
        component: `An \`AlertDialog\` is a modal used to communicate an
        important message and requires a response. They should not close on
        an outside interaction. The dialog requires \`aria-describedby\` to be
        provided, pointing to an element containing the alert message.`,
      },
    },
  },
}

export const Default = () => {
  const alertId = useId()

  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <AlertDialog content={{ 'aria-describedby': alertId }}>
        <div id={alertId}>
          <button>a button</button>
        </div>
      </AlertDialog>
    </DialogTrigger>
  )
}
