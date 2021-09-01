import {
  useEffect,
  useState
} from 'react'
import {
  useParams
} from 'react-router-dom'
import { ParsedTSV } from './types'
import { Systems, getSystems } from './Systems'

const permissionBaseUrl = 'https://ajqdvfh0r0.execute-api.eu-west-3.amazonaws.com'

interface SuccessProps {
  bytes: Blob
  name: string
  downladName: string
  systems?: ParsedTSV
}

const Success = ({bytes, name, downladName, systems}: SuccessProps) =>
  <div>
    <div className="border p-4 border-shrimp mb-3">
      <div className="mb-4">
        <div className="text-xl">
          Success!
        </div>
        Your file {name} has been successfully processed by Defense Finder.<br/>
      </div>
      <div>
        Download the full analysis results:&nbsp;
        <a
          href={URL.createObjectURL(bytes)}
          download={downladName}
          className="text-shrimp hover:underline">
          {downladName}
        </a>
      </div>
    </div>
    <div className="overflow-x-scroll">
      <Systems systems={systems} />
    </div>
  </div>

const Loader = ({name}: {name: string}) =>
  <div className="border p-4 border-shrimp">
    Processing {name}... This usually takes less than a minute.
  </div>

export const Result = () => {
  const { result } = useParams<{ result: string }>()
  const [bytes, setBytes] = useState<Blob>()
  const [systems, setSystems] = useState()

  const fileName = result.split('.').slice(1).join('.')
  const downloadName = `${fileName}.zip`
  const key = `${result}.zip`

  useEffect(() => {
    let timer: NodeJS.Timer
    const fetchResults = async () => {
      let attempts = 0
      const permissionUrl = `${permissionBaseUrl}?key=${key}&type=get`
      const permRes = await fetch(permissionUrl)
      const { url } = await permRes.json()
      const retry = async () => {
        const objectRes = await fetch(url)
        if (objectRes.status === 200) {
          const bytes = await objectRes.blob()
          setBytes(bytes)
          const systems = await getSystems(bytes)
          setSystems(systems as any)
        }
        else {
          attempts++
          if (attempts < 30) {
            timer = setTimeout(retry, (attempts + 2) * 500)
          }
        }
      }
      retry()
    }
    fetchResults()
    return () => clearTimeout(timer)
  }, [setBytes, downloadName, key, setSystems])

  const content = bytes
    ? <Success name={fileName} downladName={downloadName} bytes={bytes} systems={systems}/>
    : <Loader name={fileName} />

  return (
    <div className="container mx-auto">
      {content}
    </div>
  )
}
