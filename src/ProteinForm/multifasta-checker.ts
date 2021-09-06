const groupByHeaders = <T>(
  data: Array<T>,
  isHeader: (t: T) => boolean
): Array<Array<T>> => {
  const out: Array<Array<T>> = []
  if (data.length === 0) {
    return out
  }
  const [firstLine, ...rest] = data
  let currentGroup: Array<T> = [firstLine]
  for (let line of rest) {
    if (isHeader(line)) {
      out.push(currentGroup)
      currentGroup = [line]
    } else {
      currentGroup.push(line)
    }
  }
  if (currentGroup.length) {
    out.push(currentGroup)
  }
  return out
}

const isFastaHeader = (line: string) => {
  return line.length > 0 && line[0] === '>'
}

export const validateMultiFasta = (multifasta: string): boolean => {
  const lines = multifasta.split('\n').map((l) => l.trim())
  const fastaGroups = groupByHeaders(lines, isFastaHeader)
  const reducer = (allValid: boolean, val: string[]) =>
    allValid && isFastaValid(val)
  return fastaGroups.reduce(reducer, true)
}

const isFastaValid = (lines: string[]): boolean => {
  if (!lines.length) {
    return false
  }

  if (lines[0][0] !== '>') {
    return false
  }

  const fastaBody = lines.slice(1).join('').trim()

  if (!fastaBody) {
    return false
  }

  return /^[A-Z*-]+$/.test(fastaBody)
}
