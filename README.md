# jam-server

## Installing npm dependencies

### With .npmrc
- Generate a token with repo and read:packages scopes
- do ```NPM_AUTH_TOKEN=<your token>``` to set it as environment variable
- ```npm install```

### Without .npmrc on root
- Use ```npm --registry=https://npm.pkg.github.com adduser```
  - Generate a token with repo and read:packages scopes, don't enter your github password.
- And then do ```npm config set @dab-co:registry https://npm.pkg.github.com```
- Run npm install
