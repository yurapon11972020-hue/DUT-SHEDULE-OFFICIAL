FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./package.json
COPY server.js ./server.js
COPY public ./public
COPY data ./data
EXPOSE 3000
CMD ["node", "server.js"]
