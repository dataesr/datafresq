Commands
---

* `npm i` to install the app
* `bun run dev` to run the app in dev mode
* `bun run start` to run the app in prod mode

create a `.env` file at the root of the project


Stack
---
* Bun
(To upgrade bun to the lastest version, please run `bun upgrade`)


Deploy
---
* git pull --rebase
* git switch main
* git pull origin main --rebase --tags
* git merge origin staging
* npm version [patch|minor|major]
* git push origin main --tags
* git switch staging
* git merge origin main
* git push