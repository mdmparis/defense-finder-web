import {
  useParams
} from 'react-router-dom'

export const Result = () => {
  const { result } = useParams<{ result: string }>()
  return (
    <div>Results: {result}</div>
  )
}
