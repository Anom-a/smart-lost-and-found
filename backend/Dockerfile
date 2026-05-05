FROM php:8.1.2-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libxml2-dev curl unzip \
    && docker-php-ext-install pdo_pgsql dom \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html

# Copy everything and install dependencies
COPY . .
RUN composer install --no-dev --optimize-autoloader

EXPOSE 8000

CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
