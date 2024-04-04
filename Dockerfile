# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install express 

# Copy the rest of the application files
COPY . .

# Expose the 
EXPOSE 3000


# Command to run your application
CMD ["node", "node.js"]
