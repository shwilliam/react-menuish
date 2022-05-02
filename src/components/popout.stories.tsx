import { useState } from 'react'
import { PopoutVariant } from './dialog-variant'
import { Lorem } from './lorem'

export default {
  title: 'Popout',
}

export const Default = () => {
  return (
    <>
      <PopoutVariant
        trigger={({ ref, open }) => (
          <button ref={ref} onClick={open}>
            open
          </button>
        )}
      >
        <Lorem paragraphs={5} />
      </PopoutVariant>
      <Lorem paragraphs={50} />
    </>
  )
}

export const ExternalState = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <PopoutVariant
        trigger={({ ref, open }) => (
          <button ref={ref} onClick={() => setIsOpen(true)}>
            open
          </button>
        )}
        dialog={{
          isOpen,
          onClose: () => setIsOpen(false),
        }}
      >
        <Lorem paragraphs={5} />
      </PopoutVariant>
      <Lorem paragraphs={50} />
    </>
  )
}
