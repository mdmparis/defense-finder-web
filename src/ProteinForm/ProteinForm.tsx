import { useCallback, useState } from 'react'
import { useDropzone, DropzoneOptions } from 'react-dropzone'
import XIcon from '@heroicons/react/outline/XIcon'
import CloudUploadIcon from '@heroicons/react/solid/CloudUploadIcon'
import './ProteinForm.css'

const Dropzone = ({ onDrop }: { onDrop: DropzoneOptions['onDrop'] }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: '.faa',
  })
  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center py-10 px-4 border mb-4 cursor-pointer rounded ${
        isDragActive ? 'border-dashed border-gray-400' : 'bg-gray-100'
      }`}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon className="h-20 w-20 text-gray-500" />
      <span className="text-gray-500">
        Drag and drop your <span className="text-red-500">.faa</span> protein
        file
      </span>
      <span className="text-gray-400 mt-1">or</span>
      <div>
        <button className="py-1 px-2 border rounded bg-gray-200 hover:bg-gray-100 focus:border-gray-500 text-gray-500 border-gray-400">
          Open file dialog
        </button>
      </div>
    </div>
  )
}

interface SelectedFileProps {
  fileName: string
  resetFile: () => void
}

const SelectedFile = ({ fileName, resetFile }: SelectedFileProps) => (
  <div className="flex flex-row justify-between bg-gray-100 p-4 border mb-4">
    {fileName}
    <XIcon onClick={resetFile} className="h-5 w-5 cursor-pointer" />
  </div>
)

export function ProteinForm() {
  const [proteinFile, setProtein] = useState<File>()

  const resetProtein = useCallback(() => {
    setProtein(undefined)
  }, [setProtein])

  const onDrop = useCallback((acceptedFiles) => {
    setProtein(acceptedFiles[0])
    console.log('acceptedFiles', acceptedFiles)
  }, [])

  const onSubmit = (e: any) => {
    e.preventDefault()
    console.log('e', e)
  }

  return (
    <div className="container mx-auto">
      <form onSubmit={onSubmit}>
        <div className="flex flex-col mx-10">
          {proteinFile ? (
            <SelectedFile fileName={proteinFile.name} resetFile={resetProtein} />
          ) : (
            <Dropzone onDrop={onDrop} />
          )}
          {proteinFile && (
            <button
              type="submit"
              className="p-4 border text-blue-700 rounded bg-blue-100 hover:bg-blue-500 focus:bg-blue-700 hover:text-white focus:text-white"
            >
              Search for defense systems
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
