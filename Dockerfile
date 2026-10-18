# Use a base image
FROM node:18-alpine

# Add openssl
RUN apk add --no-cache openssl

# Set the working directory
WORKDIR /app

# Copy all code/config we need (see .dockerignore)
COPY . .

# Install dependencies
RUN npm install

RUN npx prisma generate

# Build the application
RUN npm run build

RUN npm prune --production
RUN rm -rf /root/.cache/Cypress

# Uploaded images and files are stored here. Mount a persistent volume at
# this path, otherwise uploads are lost when the container is replaced.
ENV UPLOAD_DIR=/data/uploads
RUN mkdir -p /data/uploads

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
