import { useState } from 'react'
import { AlertDialog } from './alert-dialog'
import { useId } from '../hooks/id'

export default {
  title: 'Alert Dialog',
}

export const Default = () => {
  const [isOpen, setIsOpen] = useState(false)
  const alertId = useId()

  return (
    <>
      <button onClick={() => setIsOpen(true)}>open</button>
      <AlertDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={{ 'aria-describedby': alertId }}
      >
        <div id={alertId}>
          <button>a button</button>
        </div>
      </AlertDialog>
    </>
  )
}
