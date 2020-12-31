FROM node:12-alpine

EXPOSE 8080

WORKDIR /app

CMD ["node", "service.js"]

COPY service.js /app/service.js

COPY node_modules /app/node_modules

