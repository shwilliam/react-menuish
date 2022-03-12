import { Popover } from './popover'
import { Lorem } from './lorem'

export default {
  title: 'Popover',
}

export const Default = () => {
  return (
    <>
      <Popover
        mobileVariant="modal"
        trigger={({ ref, open }) => (
          <button ref={ref} onClick={open}>
            open
          </button>
        )}
      >
        <Lorem />
      </Popover>
      <Lorem paragraphs={5} />
    </>
  )
}
