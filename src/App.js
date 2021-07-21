import './App.css';
import { ProteinForm } from './ProteinForm/ProteinForm'

function App() {
  return (
    <div className="App">
      <div className="flex flex-col">
        <header className="mb-8 p-5 flex flex-row justify-between items-center border-b">
          <div className="flex flex-col">
            <div>
              Defense Finder
            </div>
            <div className="text-sm text-gray-400">
              Systematic search of all known anti-phage systems
            </div>
          </div>
          <div>
            By MDM Labs, Paris
          </div>
        </header>
        <ProteinForm />
      </div>
    </div>
  );
}

export default App;
