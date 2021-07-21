import './App.css';
import { ProteinForm } from './ProteinForm/ProteinForm'

function App() {
  return (
    <div className="App">
      <div className="flex flex-col">
        <header className="mb-8 p-5 flex flex-row justify-between border-b">
          <div>
            Defense Finder
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
