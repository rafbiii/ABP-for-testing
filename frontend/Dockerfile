FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create startup script to replace port 80 with Railway's PORT
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'sed -i "s/listen 80;/listen ${PORT:-80};/g" /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]
