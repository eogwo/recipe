const express = require('express');
const axios = require('axios'); 
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const app = express();
const PORT = process.argv[2];
const API_KEY = "a582b6e1d0f4476f91cfdd28718ea85d";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.setPrompt('Stop to shutdown server: ');
rl.prompt();
rl.on('line', (command) => {
    if (command === 'stop') {
        rl.close();
        process.exit(0);
    }
    rl.prompt();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://eagbo:QWjxxLfOq6Jd16Yj@cluster0.sm1ny.mongodb.net/?retryWrites=true&w=majority&appName=cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        await client.close();
    }
}
run().catch(console.dir);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

app.get('/', (request, response) => {
    response.render('index');
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/createAcct', (request, response) => {
    response.render('createAcct');
});

app.post('/createAcct', async (request, response) => {

    const name = request.body.name || '';
    const email = request.body.email || '';
    const number = request.body.number || '';
    const password = request.body.password || '';

    await client.connect();
    await client.db("recipe").collection("recipecollections").insertOne({ name, email, number, password });
    await client.close();
    response.render('processAcctInfo', { name, email, number, password });
});

app.get('/finder', (request, response) => {
    response.render('finder');
});

app.post('/finder', async (request, response) => {
    const query = request.body.word || '';
    
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${API_KEY}`;
    const apiResponse = await axios.get(url); 
    const recipes = apiResponse.data.results; 
   
    response.render('listResults', { recipes });
});

app.get('/recipe/:id', async (req, res) => {
    const recipeId = req.params.id;
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;

    const apiResponse = await axios.get(url);
    const recipeDetails = apiResponse.data; 
    
    res.render('recipeDetails', { recipeDetails });
});