def handler(event, context):
    s3 = event['Records'][0]['s3']
    bucket = s3['bucket']['name']
    object = s3['object']['key']
    # download the protein file
    # run defense-finder on it
    # upload the result to the results bucket
    # delete the protein file on s3
    return "Hello {}/{}".format(bucket, object)
