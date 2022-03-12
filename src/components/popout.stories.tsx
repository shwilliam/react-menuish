import { Popout, PopoutContent, PopoutContainer } from './popout'
import { Lorem } from './lorem'

export default {
  title: 'Popout',
}

export const Default = () => {
  return (
    <>
      <PopoutContainer>
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
      </PopoutContainer>
      <Lorem paragraphs={5} />
    </>
  )
}
