FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4001

# Use nodemon in dev (auto-reload on file changes)
CMD ["npx", "nodemon", "agent.js"]

