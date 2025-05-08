# Stage 1: Build the React app
FROM node:23-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve using nginx
FROM nginx:alpine

# Copy the build output to the nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose default nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
