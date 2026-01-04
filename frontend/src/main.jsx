import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LoginPage from './pages/LogIn.jsx'
import SignUpPage from './pages/SignUp.jsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import AuthPage from './pages/AuthPage.jsx'
import { LoginForm, SignUpForm } from './components/Forms.jsx'
import AuthContext from './contexts/AuthContext.js'


const routes = createBrowserRouter([
  {
    path: '/',
    element: <App />
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
    <AuthContext.Provider>
      <RouterProvider router={routes} />
    </AuthContext.Provider>
  </StrictMode>
)
