FROM php:8.2-apache

# ModRewriteを有効化（必要に応じて）
RUN a2enmod rewrite

# 権限変更用のパッケージや必要な拡張モジュールがあればここに追加します
# RUN apt-get update && apt-get install -y libzip-dev unzip && docker-php-ext-install zip

# アプリケーションのコードをコンテナにコピー
COPY . /var/www/html/

# save.php などでファイル保存を行うため、Apacheの実行ユーザー（www-data）に書き込み権限を付与
RUN chown -R www-data:www-data /var/www/html/
