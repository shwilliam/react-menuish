import { Popout, PopoutContent } from './popout'
import { Lorem } from './lorem'
import { useState } from 'react'

export default {
  title: 'Popout',
}

export const Default = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Popout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        trigger={({ anchorRef }) => (
          <button ref={anchorRef} onClick={() => setIsOpen(true)}>
            open
          </button>
        )}
      >
        <PopoutContent>
          <Lorem />
        </PopoutContent>
      </Popout>
      <Lorem paragraphs={5} />
    </>
  )
}
