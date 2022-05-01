import { useState } from 'react'
import { Popout } from './popout'
import { Lorem } from './lorem'
import { DialogTrigger } from './dialog'

export default {
  title: 'Popout',
}

export const Default = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Popout
      // isOpen={isOpen}
      // onClose={() => setIsOpen(false)}
      // trigger={(props) => (
      //   <button {...props} onClick={() => setIsOpen(true)}>
      //     open
      //   </button>
      // )}
      >
        <Lorem paragraphs={5} />
      </Popout>
      <Lorem paragraphs={50} />
    </DialogTrigger>
  )
}
