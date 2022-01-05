import './App.css'
import { ProteinForm } from './ProteinForm/ProteinForm'
import { Result } from './Results/Results'
import { Logo } from './Logo'
import { useHistory } from 'react-router-dom'

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

function AppContent() {
  const history = useHistory()
  return (
    <>
      <header className="mb-4 p-5 flex flex-row justify-between items-center border-b">
        <button onClick={() => history.push('/')} className="mr-2">
          <Logo />
        </button>
        <div>
          <div className="text-sm text-gray-400">
            Systematic search of all known anti-phage systems
          </div>
          <div className="text-sm text-shrimp">By MDM Labs, Paris</div>
        </div>
      </header>
      <div className="flex-grow">
        <Switch>
          <Route path="/result/:result">
            <Result />
          </Route>
          <Route path="/">
            <ProteinForm />
          </Route>
        </Switch>
      </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
