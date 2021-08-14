import boto3
import os
import zipfile
import subprocess

def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, _dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file),
                       os.path.relpath(os.path.join(root, file),
                                       os.path.join(path, '..')))

def handler(event, context):
    s3 = boto3.resource('s3')
    results_bucket = os.environ['results_bucket']

    s3_data = event['Records'][0]['s3']
    bucket = s3_data['bucket']['name']
    object = s3_data['object']['key']

    # Download file and run defense finder
    input_file_location = '/tmp/{}'.format(object)
    output_dir = '/tmp/output'
    df_script = 'defense-finder run {} --out-dir {}'.format(input_file_location, output_dir)

    s3.Bucket(bucket).download_file(object, input_file_location)
    os.mkdir(output_dir)
    subprocess.run(df_script, shell=True)

    # Zip and upload results
    results_folder_name = os.listdir(output_dir)[0]
    results_dir = '{}/{}'.format(output_dir, results_folder_name)
    output_archive_name = '{}.zip'.format(object)
    output_archive_location = '/tmp/{}.zip'.format(object)

    zipf = zipfile.ZipFile(output_archive_location, 'w', zipfile.ZIP_DEFLATED)
    zipdir(results_dir, zipf)
    zipf.close()

    s3.Bucket(results_bucket).upload_file(output_archive_location, output_archive_name)
