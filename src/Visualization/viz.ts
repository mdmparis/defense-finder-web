import JSZip from 'jszip'

export const getFileAsJSON = async (zip: JSZip, matcher: string) => {
  const zipObjects = zip.file(new RegExp(matcher))
  debugger
  if (zipObjects.length === 0) {
    console.log('no file')
    return null
  }
  const zipObject = zipObjects[0]
  const text = await zipObject.async('text')
  return JSON.parse(text.replace(/\bNaN\b/g, 'null'))
}

export const getZipFromBytes = (bytes: Blob): Promise<JSZip> => {
  let zip = new JSZip()
  return zip.loadAsync(bytes)
}
