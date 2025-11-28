const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()
const port = 4000;

app.use(cors());
app.use(express.json());

DB_USERNAME = "Model-db" 
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD }@project-1.oweemrl.mongodb.net/?appName=Project-1`;

console.log("===PASWORD===",process.env.DB_PASSWORD )
console.log("===UserName===",process.env.DB_USERNAME)
// const uri = `mongodb+srv://Model-db:cpzspZHxs5yNisFm@project-1.oweemrl.mongodb.net/?appName=Project-1`;
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
    const db = client.db('Model-db');

    const modelCollection = db.collection('models');
    const foodCollection = db.collection('foods');
    const requestsCollection = db.collection('foodRequests'); 

    /** ===== MODELS ROUTES ===== **/
    app.get('/models', async (req, res) => {
      const result = await modelCollection.find().toArray();
      res.send({ success: true, data: result });
    });

    app.get('/models/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const model = await modelCollection.findOne({ _id: new ObjectId(id) });
        if (!model) return res.status(404).send({ success: false, message: "Model not found" });
        res.send({ success: true, data: model });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    /** ===== FOODS ROUTES ===== **/
    app.get("/search", async (req, res) => {
  try {
    let searchText = req.query.search;
    if (!searchText) {
      return res.status(400).send({ success: false, message: "Search text is required" });
    }

    searchText = searchText.trim();
    const regex = new RegExp(searchText, "i"); 

    const foods = await foodsCollection.find({ title: regex }).toArray();

    res.send({ success: true, data: foods });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Server error" });
  }
})

   
    app.get("/foods", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.status(400).send({ success: false, message: "Email is required" });

        const foods = await modelCollection.find({ email }).toArray();
        res.send({ success: true, data: foods });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    // Add new food
app.post("/foods", async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.category || !data.thumbnail) {
      return res.status(400).send({ success: false, message: "Required fields missing" });
    }
    const result = await modelCollection.insertOne(data);
    res.send({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Server error" });
  }
});

    // Get single food by ID (for update pre-fill)
    app.get("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.status(400).send({ success: false, message: "Invalid ID" });

        const food = await modelCollection.findOne({ _id: new ObjectId(id) });
        if (!food) return res.status(404).send({ success: false, message: "Food not found" });

        res.send({ success: true, data: food });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });
app.get("/add-food", async (req, res) => {
  try {
    const foods = await modelCollection.find().toArray();
    console.log(foods,"line-1.43")
    res.send({ success: true, data: foods });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Server error" });
  }
});



    // Update food
    app.put("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const data = req.body;

        if (!ObjectId.isValid(id)) return res.status(400).send({ success: false, message: "Invalid ID" });

        const result = await modelCollection.updateOne({ _id: new ObjectId(id) }, { $set: data });
        if (result.matchedCount === 0) return res.status(404).send({ success: false, message: "Food not found" });

        const updatedFood = await modelCollection.findOne({ _id: new ObjectId(id) });
        res.send({ success: true, data: updatedFood });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    // Delete food
    app.delete("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.status(400).send({ success: false, message: "Invalid ID" });

        const result = await modelCollection.deleteOne({ _id: new ObjectId(id) });
        res.send({ success: true, data: result });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    /** ===== FOOD REQUESTS ===== **/
app.get("/manage-my-foods", async (req, res) => {
  try {
    const email = req.query.email;
    console.log(email)
    if (!email) {
      return res.status(400).send({ success: false, message: "Email is required" });
    }

    const foods = await modelCollection.find({ email: email }).toArray();
    console.log(foods)

    res.send({ success: true, data: foods });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Server error" });
  }
});


    
    // Get all requests for logged-in user
    app.get("/my-food-requests", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.status(400).send({ success: false, message: "Email is required" });

        const requests = await requestsCollection.find({ requesterEmail: email }).toArray();
        res.send({ success: true, data: requests });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    // Add new food request
    app.post("/foodRequests", async (req, res) => {
      try {
        const data = req.body;
        const result = await requestsCollection.insertOne(data);
        res.send({ success: true, data: result });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    console.log("MongoDB connected successfully");
  } finally {
    // client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => res.send('Server is running'));
app.listen(port, () => console.log(`Server listening on port ${port}`));



























































