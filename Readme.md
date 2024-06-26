# Recipe website

Here is the backend code for a recipe website.

The frontend code for the website: https://github.com/kevinbencs/recipe-site-frontend

The website can be viewed here: https://recipe-deploye.vercel.app/

Technologies used: `node.js, express, sqlite, mongodb, bcrypt, cookie-parser, nodemon, cors, express-validator.`

<br/><br/>

## Usage guide:

1. Install the dependencies with `npm install`.
2. Create a `.env` file in the root directory containing the following:
```
#DATABASE_STRING
URI=''
#SERVER_PORT
PORT=3001
#TOKEN
SECRET_ACCESS_TOKEN=''
```

3. Enter `npm run` secretkey in the terminal. Copy the received code into the `.env` file under `SECRET_ACCESS_TOKEN` (inside the quotes).
4. Create a database in MongoDB, then copy the corresponding URI into the `.env` file.
5. Enter `npm run database` in the terminal. It will populate the sqlite database with recipes.
6. Start the server with `npm run dev`.

The frontend is already located in the `public` directory.

<br/><br/>


## Description of the code

The server starts with `server.js`. The express server is created and started, the connection to MongoDB is established, and it is set up to send the HTML file in the `public` directory for any URL request here. The rest of the server is in the `src` directory.


The `config.js` reads `URI`, `PORT`, and `SECRET_ACCESS_TOKEN` from the `.env` file.

In the `models `directory, you will find the `Mongoose schemas` for `accounts`, `blacklist`, and `newsletters`.

The `auth.js` in the `routes` directory contains the post requests. Here, the data submitted through forms is validated, with the `Validate` function defined in `validate.js`.

Further handling of post requests is in `controllers.js` in the `controllers` directory.

Verification of whether someone is logged into their account occurs in `index.js`. The definition of the `Verify` function - what is used in the `index.js` - is in `verify.js` in the `middleware` directory.




