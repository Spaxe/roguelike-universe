FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/client
WORKDIR /usr/src/client

# Install app dependencies
COPY package.json /usr/src/client/
RUN npm install

# Bundle app source
COPY . /usr/src/client

EXPOSE 8003
CMD [ "node", "node_modules/http-server/bin/http-server", "-p", "8003" ]
