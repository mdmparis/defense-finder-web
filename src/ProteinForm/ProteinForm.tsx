import { useCallback, useState } from 'react'
import { useDropzone, DropzoneOptions } from 'react-dropzone'
import XIcon from '@heroicons/react/outline/XIcon'
import CloudUploadIcon from '@heroicons/react/solid/CloudUploadIcon'
import { useHistory } from "react-router-dom";
import { v4 as uuid } from 'uuid'
import { validateMultiFasta } from './multifasta-checker'

const baseUrl = 'https://ajqdvfh0r0.execute-api.eu-west-3.amazonaws.com'

const checkMultifastaFile = (file: File): Promise<boolean> => {
  let resolve = (_value: boolean) => {}
  const deferred = new Promise<boolean>((res) => { resolve = res })
  const handleFileLoad = (e: any) => resolve(validateMultiFasta(e.target.result))
  const reader = new FileReader();
  reader.onload = handleFileLoad;
  reader.readAsText(file);
  return deferred
}

const Dropzone = ({ onDrop }: { onDrop: DropzoneOptions['onDrop'] }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false
  })
  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center py-10 px-4 border mb-4 cursor-pointer rounded border-shrimp border-dashed ${
        isDragActive ? 'bg-beige' : ''
      }`}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon className="h-20 w-20 text-shrimp" />
      <span className="text-gray-500">
        Drag and drop your <span className="text-shrimp">FASTA</span> protein file
      </span>
      <span className="text-gray-500 mt-1">or</span>
      <div>
        <button className="py-1 px-2 border rounded text-gray-500" type="button">
          Open file dialog
        </button>
      </div>
    </div>
  )
}

interface SelectedFileProps {
  fileName: string
  resetFile: () => void
    uploading: boolean
}

const SelectedFile = ({ fileName, resetFile, uploading }: SelectedFileProps) => (
  <div className="flex flex-row justify-between p-4 border border-shrimp mb-4 text-shrimp bg-beige">
    {fileName}
    {!uploading && <XIcon onClick={resetFile} className="h-5 w-5 cursor-pointer" />}
  </div>
)

export function ProteinForm() {
  const [proteinFile, setProtein] = useState<File>()
  const [uploading, setUploading] = useState(false)
  const [invalidFile, setInvalidFile] = useState(false)
  const history = useHistory()

  const resetProtein = useCallback(() => {
    setProtein(undefined)
  }, [setProtein])

  const onDrop = useCallback(async (acceptedFiles) => {
    const valid = await checkMultifastaFile(acceptedFiles[0])
    if (valid) {
      setInvalidFile(false)
      setProtein(acceptedFiles[0])
    }
    else {
      setInvalidFile(true)
    }
  }, [setInvalidFile])

  const onSubmit = async (e: any) => {
    e.preventDefault()
    if (!proteinFile?.name) return
    setUploading(true)
    const fullName = `${uuid()}.${proteinFile.name}`
    const permissionUrl = `${baseUrl}?key=${fullName}&type=put`
    const res = await fetch(permissionUrl, { method: "GET" })
    const { url } = await res.json()
    await fetch(url, {
      method: "PUT",
      body: proteinFile
    })
    history.push(`/result/${fullName}`)
  }

  return (
    <div className="container mx-auto">
      <div className="p-4 text-gray-500">
        DefenseFinder is a program to systematically detect known anti-phage systems. DefenseFinder uses MacSyfinder.<br/>
        For more details about how DefenseFinder works please refer to the <a className="text-shrimp" href="https://github.com/mdmparis/defense-finder/blob/master/README.md">documentation</a> and the publication.<br/>
        In DefenseFinder associated publication, you can find the detection of known anti-phage systems on the RefSeq database from May 2021.
      </div>
      <form onSubmit={onSubmit}>
        <div className="mx-10">
          {invalidFile && (
            <div className="flex flex-row justify-between p-4 border border-shrimp mb-4 text-beige bg-shrimp">
              <span>
                Uploaded file should be in <a href="https://en.wikipedia.org/wiki/FASTA_format" className="underline">FASTA</a> format.
              </span>
              <XIcon onClick={() => setInvalidFile(false)} className="h-5 w-5 cursor-pointer" />
            </div>
          )}
          {proteinFile ? (
            <SelectedFile fileName={proteinFile.name} resetFile={resetProtein} uploading={uploading}/>
          ) : (
            <Dropzone onDrop={onDrop} />
          )}
          {proteinFile && (
            uploading
              ? <button
                disabled
                type="submit"
                className="p-4 bg-shrimp text-white border border-shrimp rounded"
              >
                Uploading...
              </button>
              : <button
                type="submit"
                className="p-4 bg-shrimp text-white border border-shrimp rounded"
              >
                Scan for defense systems
              </button>
          )}
        </div>
      </form>

    </div>
  )
}
