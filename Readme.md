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

## Api Requests


- POST /signup: Registers a user

Body:
```
name:       string,
email:      string,
password:   string,
newsletter: boolean,
password2:  string,
term:       boolean
```

Return:
```
Code   Description
200    success: 'Thank you for registering with us. Your account has been successfully created.'
```

Error:
```
Code   Description
500    error: 'Server error'
400    error: "It seems you already have an account, please log in instead.",
```

- POST /signin: logs in a user

Body:
```
email:    string,
password: string,
```

Return:
```
Code   Description
200    success: user.name
```

Error:
```
Code   Description
500    error: 'Server error'
401    error: 'Account does not exist'
401    error: 'Invalid email or password. Please try again with the correct credentials.'
```

- GET /logout: Logout user

Return:
```
Code   Description
200    success: 'You are logged out!'
```

Error:
```
Code   Description
500    error: 'Server error'
```

- PATCH /api/forgotpassword: Change password

Body:
```
email: string
```

Return:
```
Code   Description
200    success: 'Sorry, we cannot send email.'
```

Error:
```
Code   Description
500    error: 'Server error'
```

- PATCH /newpassword: Change password

Body:
```
```

Return:
```
Code   Description
200    success: 'Password changed.'
```

Error:
```
Code   Description
500    error: 'Server error'
401    error: 'Please log in.'
401    error: 'This session has expired. Please login'
400    error: 'New password and old password are same.'
```

- GET /getcomment/:recipeId: Get comments

Return:
```
Code   Description
200    rows: row[]
```

```
row: 
    email: string;
    comment: string;
    name: string;
    mealId: string;
    canChange: string;
```

Error:
```
Code   Description
500    error: 'Server error'
```

- POST /sendcomment/:recipeId: Send comment

Body:
```
comment: string
```

Return:
```
Code   Description
200    success: 'Comment saved'
```

Error:
```
Code   Description
500    error: 'Server error'
401    error: 'Please login'
401    error: "This session has expired. Please login"
```

- POST /newsletter: Subsribe for newsletter

Body:
```
name: string,
email: string,
meat: boolean,
vegetarian: boolean,
dessert: boolean,
pasta: boolean,
seafood: boolean,
side: boolean
```

Return:
```
Code   Description
200    success: 'Thank you for your subscription.'
```

Error:
```
Code   Description
500    error: 'Server error'
400    error: 'It seems you already have a subscription.'
400    error: 'Please select min one option.'
``` 

- PATCH /updatecomment/:Id: Update a comment

Body:
```
comment: string
```

Return:
```
Code   Description
204
```

Error:
```
Code   Description
500    error: 'Server error'
401    error: 'Please login'
401    error: 'This session has expired. Please login'
401    error: 'You cannot change this comment'
```
 
- DELETE /deletecomment/:recipeId: Delete a comment

Return:
```
Code   Description
204
```

Error:
```
Code   Description
500    error: 'Server error'
401    error: 'Please login'
401    error: 'This session has expired. Please login'
401    error: 'You cannot delete this comment'
500    error: 'Comment not deleted' 
```

- GET /api/search/:text: GET search meal

Return:
```
Code   Description
200    res: { rec: row[], num: number }
```

```
row:
    strMeal: string,
    strCategory: string,
    strInstructions: string,
    strMealThumb: string,
    id: string
```

Error:
```
Code   Description
500    error: 'Server error'
```

- GET /api/search/:text/:number: GET search meal

Return:
```
Code   Description
200    res: row[]
```


```
row:
    strMeal: string,
    strCategory: string,
    strInstructions: string,
    strMealThumb: string,
    id: string
```

Error:
```
Code   Description
500    error: 'Server error'
```

- GET /api/comments/:recipeId: GET comments

Return:
```
Code   Description
200    success: row[]
```

```
row:
    email: string;
    comment: string;
    name: string;
    mealId: string;
    canChange: string;
```

Error:
```
Code   Description
500    error: 'Server error'
```

- GET /api/morerecipe/:title/:number: Get recipes for recipe page

Return:
```
Code   Description
200    res: row[]
```

```
row:
    strMeal: string,
    strCategory: string,
    strInstructions: string,
    strMealThumb: string,
    id: string
```

Error:
```
Code   Description
500    error: 'Server error'
```

- GET /api/title/:title: Get recipe for recipe page

Return:
```
Code   Description
200    res: { rec: recipe, num: number }
```

```
recipe:
    id:  number,
    strMeal: string,
    strCategory: string,
    strInstructions: string,
    strMealThumb: string,
    strYoutube: string,
    strIngredient1: string,
    strIngredient2: string,
    strIngredient3: string,
    strIngredient4: string,
    strIngredient5: string,
    strIngredient6: string,
    strIngredient7: string,
    strIngredient8: string,
    strIngredient9: string,
    strIngredient10: string,
    strIngredient11: string,
    strIngredient12: string,
    strIngredient13: string,
    strIngredient14: string,
    strIngredient15: string,
    strIngredient16: string,
    strIngredient17: string,
    strIngredient18: string,
    strIngredient19: string,
    strIngredient20: string,
    strMeasure1: string,
    strMeasure2: string,
    strMeasure3: string,
    strMeasure4: string,
    strMeasure5: string,
    strMeasure6: string,
    strMeasure7: string,
    strMeasure8: string,
    strMeasure9: string,
    strMeasure10: string,
    strMeasure11: string,
    strMeasure12: string,
    strMeasure13: string,
    strMeasure14: string,
    strMeasure15: string,
    strMeasure16: string,
    strMeasure17: string,
    strMeasure18: string,
    strMeasure19: string,
    strMeasure20: string
```

Error:
```
Code   Description
500    error: 'Server error'
```

- GET /api/category/:category: Get recipes for category page

Return:
```
Code   Description
200    res:{ rec: row[], num: number }
```

```
row:
    strMeal: string,
    strCategory: string,
    strInstructions: string,
    strMealThumb: string,
    id: string
```

Error:
```
Code   Description
500    error: 'Server error'
```
 
- GET /api/:category/:number: Get recipes for category page

Return:
```
Code   Description
200    res: row[]
```

row:
    strMeal: string,
    strCategory: string,
    strInstructions: string,
    strMealThumb: string,
    id: string
```

Error:
```
Code   Description
500    error: 'Server error'
```
 
- GET /homePage: Get recipes for home page

Return:
```
Code   Description
200    res: row[]
```

```
row:
    strMeal: string,
    strCategory: string,
    strInstructions: string,
    strMealThumb: string,
    id: string
```

Error:
```
Code   Description
500    error: 'Server error'
```
 








