import {
  useEffect,
  useState
} from 'react'
import {
  useParams
} from 'react-router-dom'

const permissionBaseUrl = 'https://ajqdvfh0r0.execute-api.eu-west-3.amazonaws.com'

const Success = ({bytes, name, downladName}: {bytes: Blob, name: string, downladName: string}) =>
  <div>
    <div className="mb-4">
      <div className="text-xl">
        Success!
      </div>
      Your file {name} has been processed successfully by Defense Finder.<br/>
      Click this link to download your analysis results:
    </div>
    <div>
      <a
        href={URL.createObjectURL(bytes)}
        download={downladName}
        className="text-shrimp hover:underline">
      {downladName}
    </a>
    </div>
  </div>

const Loader = ({name}: {name: string}) =>
  <div>Processing {name}... This usually takes less than a minute.</div>

export const Result = () => {
  const { result } = useParams<{ result: string }>()
  const [bytes, setBytes] = useState<Blob>()

  const fileName = result.split('.').slice(1).join('.')
  const downloadName = `${fileName}.zip`
  const key = `${result}.zip`

  useEffect(() => {
    const fetchResults = async () => {
      const permissionUrl = `${permissionBaseUrl}?key=${key}&type=get`
      const permRes = await fetch(permissionUrl)
      const { url } = await permRes.json()
      const objectRes = await fetch(url)
      if (objectRes.status === 200) {
        const bytes = await objectRes.blob()
        setBytes(bytes)
      }
      else {
        const timer = setTimeout(fetchResults, 2000)
        return () => clearTimeout(timer)
      }
    }
    fetchResults()
  }, [setBytes, downloadName, key])

  const content = bytes
    ? <Success name={fileName} downladName={downloadName} bytes={bytes}/>
    : <Loader name={fileName} />

  return (
    <div className="container mx-auto">
      <div className="border p-4 border-shrimp">
        {content}
      </div>
    </div>
  )
}
