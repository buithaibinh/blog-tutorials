import sys
import boto3

ACCESS_KEY = 'xxxxxxxxxxxxxx'
SECRET_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxx'
bucket_name = 'S3bucketname'
fileName = "/tmp/pythontest.txt"
s3_file_name = fileName

def upload_to_aws(local_file, bucket, s3_file):


    s3 = boto3.client('s3')

    try:
        s3.upload_file(local_file, bucket, s3_file)
        print("Upload Successful")
        return True
    except FileNotFoundError:
        print("The file was not found")
        return False
    except NoCredentialsError:
        print("Credentials not available")
        return False

if __name__ == "__main__":
    f = open(fileName,"r+")
    upload_to_aws(f.name, bucket_name, s3_file_name)

