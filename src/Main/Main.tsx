import { useEffect, useState } from 'react'
import { Systems, getResult } from '../Systems/Systems'
import { Err } from '../Systems/Err'
import IframeResizer from 'iframe-resizer-react'
import { Visualization } from '../Visualization/Visualization'
import { getZipFromBytes, getFileAsJSON } from '../Visualization/viz'

type Pipeline = 'proteic' | 'nucleic' | 'nucleicCrispr'

const pipelines = {
  proteic: {
    wsId: 'b0bd9f02-5ac8-4780-b915-de1425299795',
    dfTaskId: '4aad3b99-1908-42b3-a1cd-4788f058fe45',
  },
  nucleic: {
    wsId: '3b3dfbe1-ff29-4498-8ac3-2505a98a0e79',
    dfTaskId: '4aad3b99-1908-42b3-a1cd-4788f058fe45',
    dfOutputId: 'ff78345a-1693-4775-9765-91b6014b01c4',
    vizOutputId: 'c28a9f44-b717-40f3-8c28-87e6407511a2',
  },
  nucleicCrispr: {
    wsId: '7e72ae96-ed9c-4f0d-8966-f460e72961b1',
    dfTaskId: '4aad3b99-1908-42b3-a1cd-4788f058fe45',
    dfOutputId: 'ff78345a-1693-4775-9765-91b6014b01c4',
    vizOutputId: 'c28a9f44-b717-40f3-8c28-87e6407511a2',
  },
}

const getDfOutput = (pipelineType: Pipeline, outputs: any) => {
  return outputs[pipelines[pipelineType].dfTaskId].find(
    (o: any) => o.url.indexOf('defense_finder') > -1
  )
}

const getVizOutput = (
  pipelineType: 'nucleic' | 'nucleicCrispr',
  outputs: any
) => {
  return outputs[pipelines[pipelineType].dfTaskId].find(
    (o: any) => o.url.indexOf('visualization_data') > -1
  )
}

export function Main() {
  const [systems, setSystems] = useState()
  const [error, setError] = useState<string | undefined>()
  const [vizData, setVizData] = useState<
    { contigData: any; systemData: any } | undefined
  >()
  const [pipelineType, setPipelineType] = useState<Pipeline>('nucleic')

  const resetResults = () => {
    setSystems(undefined)
    setVizData(undefined)
    setError(undefined)
  }

  const loadSystems = async (url: string) => {
    const response = await fetch(url)
    const bytes = await response.blob()
    const [error, systems] = await getResult(bytes)
    if (systems) {
      setSystems(systems as any)
    } else {
      setError(error)
    }
  }

  const loadViz = async (vizUrl: string) => {
    try {
      const vizRes = await fetch(vizUrl)
      const vizBytes = await vizRes.blob()
      const vizZip = await getZipFromBytes(vizBytes)
      const contigData = await getFileAsJSON(vizZip, 'contigs')
      const systemData = await getFileAsJSON(vizZip, 'systems')
      setVizData({ contigData, systemData })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const listener = (event: any) => {
      if (typeof event.data !== 'object' || !event.data) return
      if (event.data.emitter === 'exomodule') {
        const message = event.data.message
        if (message.type === 'RUN_OUTPUTS') {
          const dfOutput = getDfOutput(pipelineType, message.outputs)
          loadSystems(dfOutput.url)

          if (pipelineType === 'nucleic' || pipelineType === 'nucleicCrispr') {
            const vizSystemOutput = getVizOutput(pipelineType, message.outputs)
            loadViz(vizSystemOutput.url)
          }
        } else if (message.type === 'NAV_TO_NEW_RUN') {
          resetResults()
        }
      }
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [pipelineType])

  return (
    <div className="container mx-auto relative">
      <div className="border p-6 mb-6 bg-white">
        <div className="mb-2">Select your pipeline:</div>
        <select
          className="py-2 pl-2 bg-white border"
          onChange={(e) => setPipelineType(e.target.value as any)}
          value={pipelineType}
        >
          <option value="nucleic">Nucleic fasta</option>
          <option value="nucleicCrispr">
            Nucleic fasta with CRISPR array detection
          </option>
          <option value="proteic">Proteic fasta</option>
        </select>
      </div>
      <div className="border px-6 pt-6 pb-3 mb-6 bg-white">
        <IframeResizer
          checkOrigin={[
            'https://www.app.exomodule.com',
            'https://app.exomodule.com',
          ]}
          key={pipelineType}
          title="exomodule-defense-finder"
          src={`https://app.exomodule.com/ws/${pipelines[pipelineType].wsId}`}
          style={{ height: '100%', minHeight: '100%', width: '100%' }}
        />
      </div>

      {vizData && vizData.contigData && vizData.systemData ? (
        <Visualization
          contigData={vizData.contigData}
          systemData={vizData.systemData}
        />
      ) : null}
      <div>
        {systems ? (
          <Systems systems={systems} />
        ) : error ? (
          <Err error={error!} />
        ) : null}
      </div>
    </div>
  )
}
