# Template for node-express-mongo rest-api backend

 - Rename `.env.template` to `.env` to use it for environment variables

 - To run local mongo instance: `docker run --name some-mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=dbuser -e MONGO_INITDB_ROOT_PASSWORD=secretpassword -d mongo `

# Subsquid processor

In order to run subsquid processor the following steps should be done:
```sh
mv .env.example .env
# install and build dependencies
npm ci && npm run build
# run a database
make up
# start processor
make process
```

This version doesn't introduce any web servers that could serve indexed data. But express server from `server.ts` should work.