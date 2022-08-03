## create a key pair

The following example command uses OpenSSL to generate an RSA key pair with a length of 2048 bits and save to the file named private_key.pem.

```bash
openssl genrsa -out ./keys/private_key.pem 2048
```

The resulting file contains both the public and the private key. The following example command extracts the public key from the file named private_key.pem.

```bash
openssl rsa -pubout -in ./keys/private_key.pem -out ./keys/public_key.pem
```