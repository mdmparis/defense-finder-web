def handler(event, context):
    s3 = event['Records'][0]['s3']
    bucket = s3['bucket']['name']
    object = s3['object']['key']
    return "Hello {}/{}".format(bucket, object)
