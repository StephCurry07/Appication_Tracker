import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Job Application Tracker</h1>
        <p>Welcome to your local job application tracker!</p>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Applications tracked: {count}
          </button>
        </div>
        <p>
          This is a minimal setup ready for Vercel deployment.
        </p>
      </header>
    </div>
  )
}

export default App