# [2.0.0](https://github.com/TrainSL/semantic-release-workshop/compare/v1.0.0...v2.0.0) (2026-02-26)


### Features

* **users:** restructure get /users response format ([5b88017](https://github.com/TrainSL/semantic-release-workshop/commit/5b8801793d24cc1084c59b14d654447bacab7b12))


### BREAKING CHANGES

* **users:** GET /users response changed from {users, total} to {data, meta: {total}}. Clients must update to expect the new format.

# 1.0.0 (2026-02-26)


### Bug Fixes

* **commitlint:** increase body and footer max line lengths to 500 ([832d60e](https://github.com/TrainSL/semantic-release-workshop/commit/832d60eff3b33204a03e2c6caabf047fb0bc1cdc))
* **users:** validate user id and normalize email on create/update ([7558199](https://github.com/TrainSL/semantic-release-workshop/commit/7558199f38aa43fdccb3791ef9588c3ca23ffe01))


### Features

* **dependencies:** update package name and add express-rate-limit and helmet for enhanced security ([5622516](https://github.com/TrainSL/semantic-release-workshop/commit/56225164e4227ee162419362aa0000f51f3c69bb))
* **security:** add express-rate-limit for request limiting and enhance security with helmet ([f402c42](https://github.com/TrainSL/semantic-release-workshop/commit/f402c42c3f2be24c030f500e7e53664b06819e53))
* **security:** implement rate limiting, input sanitization, and enhanced error handling ([8b8f2c7](https://github.com/TrainSL/semantic-release-workshop/commit/8b8f2c70498304de014a32815b8d9884ca9075f4))
