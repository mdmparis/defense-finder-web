import './App.css'
import { ProteinForm } from './ProteinForm/ProteinForm'
import { Result } from './Results/Results'
import { Logo } from './Logo'

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

function App() {
  return (
    <Router>
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
          <Switch>
            <Route path="/result/:result">
              <Result />
            </Route>
            <Route path="/">
              <ProteinForm />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  )
}

export default App
