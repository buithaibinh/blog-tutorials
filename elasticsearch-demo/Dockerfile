FROM node:12.18.3-alpine3.12

# Create app directory

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source

COPY server.js ./

EXPOSE 3000

CMD [ "node", "server.js" ]
