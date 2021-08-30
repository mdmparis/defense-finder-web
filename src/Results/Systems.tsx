import { useMemo } from 'react'
import { Table } from './Table'
import { useTable } from 'react-table'
import { ParsedTSV } from './types'
import JSZip from 'jszip';
import Papa from 'papaparse'

export const getSystems = async (bytes: Blob) => {
  let zip = new JSZip();
  zip = await zip.loadAsync(bytes)
  const systemsZipObject = zip.file(/system/)[0]
  const systemsFileRaw = await systemsZipObject.async('text')
  const systemsFile = Papa.parse(systemsFileRaw.trim(), {
    delimiter: '\t'
  }).data
  return systemsFile
}

const formatParsedTSV = (tsv: ParsedTSV) => {
  const [head, ...body] = tsv
  if (!head) return {data: [], columns: []}
  const data = body
    .map(l => {
      const row = {}
      l.forEach((val, idx) => {
        const key = head[idx];
        (row as any)[key] = val
      })
      return row
    })
  const columns = head.map(h => ({
    Header: h,
    accessor: h
  }))
  return {
    data,
    columns
  }
}

export const Systems = ({systems}: {systems?: ParsedTSV}) => {
  const tableData = useMemo(() => formatParsedTSV(systems || []), [systems])
  const tableInstance = useTable(tableData)
  return <Table tableInstance={tableInstance} />
}

