FROM node:14

# Install pdftotext
RUN apt-get update && apt-get install -y poppler-utils

# Install pdftotext and Japanese language support
# RUN apt-get update && apt-get install -y poppler-utils fonts-ipafont fonts-ipaexfont fonts-mplus language-pack-ja

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Expose port
# EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
