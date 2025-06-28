import './App.css'
import { Button } from './components/ui/button'

function App() {
  const handleClick = () => {
    window.alert('Button clicked')
  }

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <Button onClick={handleClick}>
        Click Me
      </Button>
    </div>
  )
}

export default App
