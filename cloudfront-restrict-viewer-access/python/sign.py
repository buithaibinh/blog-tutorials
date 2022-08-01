import argparse
from botocore.signers import CloudFrontSigner
from datetime import datetime, timedelta, timezone
import rsa

def rsa_signer(message):
#    private_key = get_secret(KEY_PRIVATE_KEY)
   private_key = open("./keys/private_key.pem", "r").read()
   return rsa.sign(
       message,
       rsa.PrivateKey.load_pkcs1(private_key.encode('utf8')),
       'SHA-1')  # CloudFront requires SHA-1 hash


def sign_url(url_to_sign, days_valid):
   key_id = 'K2JL1GI7MC5JVT'
   cf_signer = CloudFrontSigner(key_id, rsa_signer)
   signed_url = cf_signer.generate_presigned_url(
       url=url_to_sign, date_less_than=datetime.now(timezone.utc) + timedelta(days=days_valid))
   return signed_url

if __name__ == "__main__":
   my_parser = argparse.ArgumentParser(
       description='CloudFront URL Signing Example')
   my_parser.add_argument('URL',
                          metavar='url',
                          type=str,
                          help='url to sign')
   my_parser.add_argument('--days',
                          metavar='days',
                          nargs='?',
                          const=1,
                          type=int,
                          default=1,
                          help='number of days valid, defaults to 1 if not specified')
   args = my_parser.parse_args()
   url_to_sign = args.URL
   days_valid = args.days

   signed_url = sign_url(url_to_sign, days_valid)
   print(signed_url)
   exit(0)
