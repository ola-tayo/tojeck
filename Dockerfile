# Use an official Node.js runtime as a base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install
RUN npm install -g html-pdf

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that your application will run on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]
