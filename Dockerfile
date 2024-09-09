FROM node:12

WORKDIR /app

COPY . .

RUN npm install

ENV PORT=80

EXPOSE 80

CMD [ "npm", "start" ]
