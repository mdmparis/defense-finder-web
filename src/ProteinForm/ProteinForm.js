import { useState } from 'react'
import './ProteinForm.css'

export function ProteinForm() {
  const [protein, setProtein] = useState()

  const onSubmit = (e) => {
    e.preventDefault()
    console.log('e', e)
  }

  return (
    <div class="container mx-auto">
      <form onSubmit={onSubmit}>
        <div className="flex flex-col mx-10">
          <textarea
            className="textarea border rounded mb-5 p-4"
            rows="15"
            name="protein"
            value={protein}
            onChange={e => setProtein(e.target.value)}
            placeholder="Paste your protein sequence for defense systems analysis"
          >
          </textarea>
          <button type="submit" className="p-4 border text-blue-700 rounded bg-blue-100 hover:bg-blue-500 focus:bg-blue-700 hover:text-white focus:text-white">
            Find defense systems
          </button>
        </div>
      </form>
    </div>
  )
}
