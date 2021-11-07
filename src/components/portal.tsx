import React from 'react'
import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import usePortal from '../hooks/portal'

interface PortalProps {
  id: string
  children: ReactNode
  noPortal?: boolean
}

const Portal = ({ id, noPortal, children }: PortalProps) => {
  const target = usePortal(id)

  if (noPortal) return <>{children}</>
  return createPortal(children, target)
}

export default Portal
