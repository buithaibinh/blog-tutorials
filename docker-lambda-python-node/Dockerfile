# python base image, boto3 installed
# https://github.com/buithaibinh/docker-boto3
FROM binhbv/boto3:latest

# Create app directory
WORKDIR /usr/src/node

# Install app dependencies
RUN apt-get update
RUN apt-get -y install curl dirmngr apt-transport-https lsb-release ca-certificates vim
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# Install aws-lambda-cpp build dependencies
RUN apt-get update && \
    apt-get install -y \
    autoconf \
    libtool \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev

# Bundle app source
COPY . .

# very important to have this line
# If the dependency is not in package.json uncomment the following line
RUN npm install aws-lambda-ric

RUN npm install

EXPOSE 8080

ENTRYPOINT ["npx", "aws-lambda-ric"]
CMD [ "server.lambdaHandler" ]
