FROM php:8.1.2-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libxml2-dev \
    && docker-php-ext-install pdo_pgsql dom \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
