FROM node:18-alpine

WORKDIR /node-app

COPY package*.json .

RUN npm install --quiet
RUN npm install typescript -g --quiet

COPY . .

# Compile TypeScript files
RUN tsc

EXPOSE 9000

# Start the application with the compiled JavaScript file
CMD ["node", "dist/app.js"]
