# Recept weboldal

Itt látható egy általam létrehozott recept weboldal backend kódja.

A weboldal frontend kódja: https://github.com/kevinbencs/recipe-site-frontend.

Backend néküli recept oldal: https://github.com/kevinbencs/recipe-site

Backend nélküli recept weboldal Github pages-e: https://kevinbencs.github.io/recipe-site/

Használt technolóiák: `node.js, express, sqlite, mongodb, bcrypt, cookie-parser, nodemon, cors, express-validator.`

Használíti útmutató:

1. telepítsük a függőségeket `npm installal`.
2. hozzunk létre egy .env fájlt a főkönyvtárba, ami a következőket tartalmazza:
- #DATABASE_STRING
- URI=''
- #SERVER_PORT
- PORT=3001
- #TOKEN
- SECRET_ACCESS_TOKEN=''

3. írjuk be a terminálba, hogy `npm run secretkey`. A megkapott kódot másoljuk be a .env fájl SECRET_ACCESS_TOKEN-jéhez ('' közé).
4. Hozzunk létre egy adatbázist a mongodb-ben, majd az ahoz tartozó URI-t másoljuk be a .env fájlba.
5. Írjuk be a terminálba, hogy `npm run database`. Ekkor receptekkel töltjük fel az sqlite adatbázist.
6. Az `npm run dev`-el már indíthatjuk is a szervert.

A fronted már megtalálható a `public` könyvtárban.