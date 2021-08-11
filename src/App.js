import './App.css'
import { ProteinForm } from './ProteinForm/ProteinForm'
import logo from './logo.svg'

function App() {
  return (
    <div className="App">
      <div className="flex flex-col">
        <header className="mb-8 p-5 flex flex-row justify-between items-center border-b">
          <img src={logo} alt="Defense Finder" style={{ width: 200 }} />
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
