import { AlertDialog } from './alert-dialog'
import { useId } from '../hooks/id'

export default {
  title: 'Alert Dialog',
}

export const Default = () => {
  const alertId = useId()

  return (
    <AlertDialog
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
      aria-describedby={alertId}
    >
      <div id={alertId}>
        <button>a button</button>
      </div>
    </AlertDialog>
  )
}
