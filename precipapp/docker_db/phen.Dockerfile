FROM node:14.17.0
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .

EXPOSE 3002
CMD [ "npm", "start" ]
