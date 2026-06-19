FROM node:18-alpine
WORKDIR /app
RUN npm init -y && npm install express express-rate-limit
COPY server.js .
EXPOSE 8080
CMD ["node", "server.js"]