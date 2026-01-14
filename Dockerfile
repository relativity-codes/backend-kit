FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --production

# Copy source
COPY . .

# Build
RUN npm run build

EXPOSE 3005

CMD ["npm", "run", "start:prod"]
