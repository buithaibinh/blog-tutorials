FROM node:18-alpine

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
