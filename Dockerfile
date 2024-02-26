# Use the official Node.js image as base
FROM node:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV GAMESITE_DB_USERNAME=postgres
ENV GAMESITE_DB_PASSWORD=qwerty
ENV GAMESITE_DB_HOST=127.0.0.1
ENV GAMESITE_DB_PORT=5432
ENV GAMESITE_DB_DATABASE=gamesite
ENV GAMESITE_SMTP_HOST=smtp.example.com
ENV GAMESITE_SMTP_PORT=465
ENV GAMESITE_SMTP_SECURE=1
ENV GAMESITE_SMTP_USER=no-reply@example.com
ENV GAMESITE_SMTP_PASSWORD=example
ENV GAMESITE_SMTP_FROM=no-reply@example.com

# RUn application
CMD [ "npm", "start" ]