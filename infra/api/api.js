require('dotenv').load()
require('dotenv').config()
const AWS = require('aws-sdk')

const credentials = {
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
}
AWS.config.update({ credentials: credentials, region: 'eu-west-3' })
const s3 = new AWS.S3()

const getPresignedGETURL = async (Key) =>
  s3.getSignedUrl('getObject', {
    Bucket: 'df-proteins',
    Key, //filename
    Expires: 240, //time to expire in seconds
  })

const getPresignedPUTURL = async (Key) =>
  s3.getSignedUrl('putObject', {
    Bucket: 'df-results-bis',
    Key, //filename
    Expires: 240, //time to expire in seconds
  })

exports.handler = async (event, _context) => {
  const parameters = event.queryStringParameters ?? {}
  const type = parameters['type']
  const key = parameters['key']

  if (['put', 'get'].indexOf(type) < 0 || !key) {
    const error = {
      statusCode: 400,
      headers: {
        'Content-Type': 'text/plain',
      },
      isBase64Encoded: false,
      body: 'Bad Request',
    }
    return error
  }

  const url =
    type === 'get'
      ? await getPresignedGETURL(key)
      : await getPresignedPUTURL(key)

  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    isBase64Encoded: false,
    body: `{\n  "url": ${url}\n}`,
  }

  return response
}
