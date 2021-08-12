import './App.css'
import { ProteinForm } from './ProteinForm/ProteinForm'
import { Logo } from './Logo'

function App() {
  return (
    <div className="App">
      <div className="flex flex-col">
        <header className="mb-8 p-5 flex flex-row justify-between items-center border-b">
          <Logo />
          <div>
            <div className="text-sm text-gray-400">
              Systematic search of all known anti-phage systems
            </div>
            <div className="text-sm text-shrimp">By MDM Labs, Paris</div>
          </div>
        </header>
        <ProteinForm />
      </div>
    </div>
  )
}

export default App
