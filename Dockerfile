FROM node:16 as build

WORKDIR /app

COPY package.json yarn.lock ./
COPY ./src/logic/contracts/artifacts/*.json ./src/logic/contracts/artifacts/
RUN yarn install --frozen-lockfile --network-concurrency 1

COPY . .
RUN yarn build

FROM nginx:stable-alpine

COPY --from=build /app/build /app

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]