import {
  useRef,
  useContext,
  useEffect,
  useMemo,
  createContext,
  ReactNode,
} from 'react'
import _ from 'lodash'
import { useId } from '@react-aria/utils'

export interface FocusTakeoverContext {
  isActiveFocusBoundary: (id: string) => boolean
  takeFocus: (id: string) => void
  restoreFocus: (id: string) => void
}

const focusTakeoverContext = createContext<FocusTakeoverContext>({
  isActiveFocusBoundary: () => false,
  takeFocus: () => {},
  restoreFocus: () => {},
})

export const FocusTakeoverContextProvider = ({ children }) => {
  const focusBoundaries = useRef<string[]>([]),
    ctxt = useMemo(
      () => ({
        isActiveFocusBoundary: (id: string) =>
          _.last(focusBoundaries.current) === id,
        takeFocus: (id: string) => {
          focusBoundaries.current = [...focusBoundaries.current, id]
        },
        restoreFocus: (id: string) => {
          focusBoundaries.current = [...focusBoundaries.current].slice(
            0,
            focusBoundaries.current.indexOf(id),
          )
        },
      }),
      [focusBoundaries],
    )

  return (
    <focusTakeoverContext.Provider value={ctxt}>
      {children}
    </focusTakeoverContext.Provider>
  )
}

export const FocusTakeoverBoundary = ({
  id,
  children,
}: {
  id?: string
  children: ReactNode
}) => {
  const innerId = useId(id),
    { takeFocus, restoreFocus } = useFocusTakeoverContext()

  useEffect(() => {
    takeFocus(innerId)
    return () => restoreFocus(innerId)
  }, [takeFocus, restoreFocus, innerId])

  return <>{children}</>
}

export const useFocusTakeoverContext = () => useContext(focusTakeoverContext)
