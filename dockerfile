FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV DB_CONNECTION_STRING=${DB_CONNECTION_STRING}

FROM node:18 AS server
WORKDIR /app
RUN mkdir public
COPY package* ./
RUN npm install --production
COPY --from=builder ./app/dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start"]