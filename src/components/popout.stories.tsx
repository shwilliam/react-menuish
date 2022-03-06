import { Popout, PopoutContent } from './popout'
import { Lorem } from './lorem'

export default {
  title: 'Popout',
}

export const Default = () => {
  return (
    <>
      <Popout
        trigger={({ anchorRef, open }) => (
          <button ref={anchorRef} onClick={open}>
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
