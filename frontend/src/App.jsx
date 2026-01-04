import { useState } from 'react'
import NavigationBar from './components/NavigationBar'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NavigationBar />
    </>
  )
}

export default App
