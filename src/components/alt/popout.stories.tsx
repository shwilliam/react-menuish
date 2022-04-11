import { Popout } from './popout'
import { Lorem } from '../lorem'
import { useState } from 'react'

export default {
  title: 'Alt/Popout',
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
        <Lorem paragraphs={5} />
      </Popout>
      <Lorem paragraphs={50} />
    </>
  )
}
