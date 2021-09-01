import boto3
import os
import zipfile
import subprocess
import pathlib
import shutil

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

    # Read event
    s3_data = event['Records'][0]['s3']
    bucket = s3_data['bucket']['name']
    object = s3_data['object']['key']

    # Download input file
    input_file_location = '/tmp/{}'.format(object)
    s3.Bucket(bucket).download_file(object, input_file_location)

    # Setup output
    output_dir = '/tmp/output/{}'.format(object)
    pathlib.Path(output_dir).mkdir(parents=True)
    output_archive_name = '{}.zip'.format(object)
    output_archive_location = '/tmp/{}.zip'.format(object)

    # Run defense finder
    df_script = 'defense-finder run {} --out-dir {}'.format(input_file_location, output_dir)
    cp = subprocess.run(df_script, shell=True, capture_output=True, text=True)

    if cp.returncode == 0:
        # Zip results
        results_folder_name = os.listdir(output_dir)[0]
        results_dir = '{}/{}'.format(output_dir, results_folder_name)

        zipf = zipfile.ZipFile(output_archive_location, 'w', zipfile.ZIP_DEFLATED)
        zipdir(results_dir, zipf)
        zipf.close()

    else:
        error_dir = '{}/error'.format(output_dir)
        pathlib.Path(error_dir).mkdir(parents=True)

        error_file_name = '{}/error.txt'.format(error_dir)
        error_file = open(error_file_name, 'w')
        error_file.write(cp.stderr)
        error_file.close()

        zipf = zipfile.ZipFile(output_archive_location, 'w', zipfile.ZIP_DEFLATED)
        zipdir(error_dir, zipf)
        zipf.close()

    # Upload result to s3
    s3.Bucket(results_bucket).upload_file(output_archive_location, output_archive_name)

    # Cleanup
    shutil.rmtree(output_dir, ignore_errors=True)
    os.remove(input_file_location)
