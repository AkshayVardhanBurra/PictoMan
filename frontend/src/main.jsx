import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {Home} from './Home.jsx'

import {createBrowserRouter, RouterProvider} from "react-router-dom"
import AuthPage from './pages/AuthPage.jsx'
import { SignUpForm } from './components/Forms.jsx'
import { LoginForm } from './components/LoginForm.jsx'
import { UserAuthContext, UserAuthFunction } from './contexts/AuthContext.jsx'


const routes = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/auth',
    element: <AuthPage />,
    children: [
      { index: true, element: <LoginForm /> },
      { path: "login", element: <LoginForm /> },
      { path: "createaccount", element: <SignUpForm /> }
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserAuthFunction>
      <RouterProvider router={routes} />
    </UserAuthFunction>
  </StrictMode>
)
