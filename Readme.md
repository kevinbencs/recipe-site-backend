# Recipe website

Here is the backend code for a recipe website.

The frontend code for the website: https://github.com/kevinbencs/recipe-site-frontend

The website can be viewed here: https://recipe-deploye.vercel.app/

Technologies used: `node.js, express, sqlite, mongodb, bcrypt, cookie-parser, nodemon, cors, express-validator., node-cache`

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

The server starts with `server.js`. Here, the express server starts, connects to MongoDB, and sends the HTML file for any URL request (the HTML file is in the `public` directory). The rest of the server is in the `src` directory.


The `config.js` reads `URI`, `PORT`, and `SECRET_ACCESS_TOKEN` from the `.env` file.

In the `models `directory, you will find the `Mongoose schemas` for `accounts`, `blacklist`, and `newsletters`.

The `auth.js` in the `routes` directory contains the post requests. Here, the data submitted through forms is validated, with the `Validate` function defined in `validate.js`.

Further handling of post requests is in `controllers.js` in the `controllers` directory.

`Index.js` checks if someone has logged into their account.
The `verify.js` file in the `middleware` directory defines the `Verify` function used in `index.js`.


<br/><br/>

## Requests


POST /signup
Registers a user

POST /signin
logs in a user

GET /logout
Logout user

PATCH /newpassword
Change password

GET /getcomment/:recipeId
Get comments

POST /sendcomment/:recipeId
Send comment

POST /newsletter
Subsribe for newsletter

 
PATCH /updatecomment/:recipeId
Update a comment
 
DELETE /deletecomment/:recipeId
Delete a comment

GET /api/search/:text
GET search meal

GET /api/search/:text/:number
GET search meal

GET /api/comments/:recipeId
GET comments

GET /api/morerecipe/:title/:number
Get recipes for recipe page

GET/api/title/:title
Get recipe for recipe page

GET /api/category/:category
Get recipes for category page

GET /api/:category/:number
Get recipes for category page

GET /homePage
Get recipes for home page
 








