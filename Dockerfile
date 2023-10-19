FROM node:18.17 as build

# Grab needed environment variables from .env.example
ENV REACT_APP_ENV=production
ENV NODE_OPTIONS=--openssl-legacy-provider

WORKDIR /app

COPY package.json yarn.lock ./
# Due to some dependencies yarn may randomly throw an error about invalid cache
# This approach is taken from https://github.com/yarnpkg/yarn/issues/7212#issuecomment-506155894 to fix the issue
# Another approach is to install with flag --network-concurrency 1, but this will make the installation pretty slow (default value is 8)
RUN mkdir .yarncache
RUN yarn install --cache-folder ./.yarncache --frozen-lockfile
RUN rm -rf .yarncache
RUN yarn cache clean

COPY . .
RUN yarn build

FROM nginx:stable-alpine

COPY --from=build /app/build /app

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]