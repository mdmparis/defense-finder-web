import { useCallback, useState } from 'react'
import { useDropzone, DropzoneOptions } from 'react-dropzone'
import XIcon from '@heroicons/react/outline/XIcon'
import CloudUploadIcon from '@heroicons/react/solid/CloudUploadIcon'

const Dropzone = ({ onDrop }: { onDrop: DropzoneOptions['onDrop'] }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: '.faa',
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
        Drag and drop the <span className="text-shrimp">.faa</span> protein file to scan for defense systems
      </span>
      <span className="text-gray-500 mt-1">or</span>
      <div>
        <button className="py-1 px-2 border rounded text-gray-500">
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
  <div className="flex flex-row justify-between p-4 border border-shrimp mb-4 text-shrimp bg-beige">
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
