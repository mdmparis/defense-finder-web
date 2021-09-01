import './App.css'
import { ProteinForm } from './ProteinForm/ProteinForm'
import { Result } from './Results/Results'
import { Logo } from './Logo'
import { useHistory } from "react-router-dom";

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

function AppContent() {
  const history = useHistory()
  return (
    <div className="flex flex-col justify-between min-h-full">
      <header className="mb-4 p-5 flex flex-row justify-between items-center border-b">
        <button onClick={() => history.push("/")} className="mr-2"><Logo /></button>
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
      <footer>
        <div className="border-t mt-8">
          <div className="p-4 text-sm container mx-auto">
            <div className="mb-1">If you are using DefenseFinder please cite:</div>
            <ul className="pl-4 text-gray-500">
              <li>
                - "Systematic and quantitative view of the antiviral arsenal of prokaryotes" bioRxiv<br/>
                <i>Tesson F., Hervé A. , Touchon M., d’Humières C., Cury J., Bernheim A.</i>
              </li>
              <li>
                - "MacSyFinder: A Program to Mine Genomes for Molecular Systems with an Application to CRISPR-Cas Systems." PloS one 2014<br/>
                <i>Abby S., Néron B.,Ménager H., Touchon M. Rocha EPC.</i>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
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
