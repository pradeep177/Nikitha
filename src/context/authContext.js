import { createContext } from 'react'

export const AuthContext = createContext({
  ready: true,
  user: null,
  role: null,
  roleError: null,
  isAdmin: false,
  isViewer: false,
  isDemo: false,
  epoch: 0,
})
