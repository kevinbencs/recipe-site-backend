# Recept weboldal

Itt látható egy általam létrehozott recept weboldal backend kódja.

A weboldal frontend kódja: https://github.com/kevinbencs/recipe-site-frontend

Az oldal megtekinthető: https://recipe-deploye.vercel.app/

Használt technolóiák: `node.js, express, sqlite, mongodb, bcrypt, cookie-parser, nodemon, cors, express-validator.`

<br/><br/>

## Használíti útmutató:

1. telepítsük a függőségeket `npm installal`.
2. hozzunk létre egy .env fájlt a főkönyvtárba, ami a következőket tartalmazza:
```
#DATABASE_STRING
URI=''
#SERVER_PORT
PORT=3001
#TOKEN
SECRET_ACCESS_TOKEN=''
```

3. írjuk be a terminálba, hogy `npm run secretkey`. A megkapott kódot másoljuk be a .env fájl SECRET_ACCESS_TOKEN-jéhez ('' közé).
4. Hozzunk létre egy adatbázist a mongodb-ben, majd az ahoz tartozó URI-t másoljuk be a .env fájlba.
5. Írjuk be a terminálba, hogy `npm run database`. Ekkor receptekkel töltjük fel az sqlite adatbázist.
6. Az `npm run dev`-el már indíthatjuk is a szervert.

A fronted már megtalálható a `public` könyvtárban.

<br/><br/>

## A kód leírása

A szerver a `server.js`-el kezdődik. Itt van létrehozva és elindítva az `express` szerver, itt található a `MongoDB`-vel létrehozott kapcsolat, továbbá itt kerül beállításra, hogy bármilyen URL kérésre a `public` könyvtárban lévő `html` fájl legyen elküldve. A szerver többi része az `src` könyvtáron belül látható.

A `.env`-ből az `URI`,`PORT` és a `SECRET_ACCESS_TOKEN` beolvasása a `config.js`-ben történik meg.

A `models` könyvtárban található a fiókok, a blacklist és a hírlevelek mongoose séma.

A `routes` könyvtárban lévő `auth.js`-ben találhatóak a post requestek. Itt megy végbe az űrlapokon beküldött adatok ellenőrzése, melyből a `Validate` függvény a `validate.js`-ben lett definiálva.

A `controllers` könyvtárban található `controllers.js`-ben találhatóak a post requestek tovvábbi kezelése.

Annak ellenőrzése, hogy valaki be van-e jelentkezve a fiókjába, az `index.js`-ben történik meg. Az itt használt `Verify` függvény a `middleware` könyvtárban található `verify.js`-ben lett definiálva.




