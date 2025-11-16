

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://Model-db:cpzspZHxs5yNisFm@project-1.oweemrl.mongodb.net/?appName=Project-1";
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
    const foodsCollection = db.collection('foods'); 

    /** ===== MODELS ROUTES ===== **/
    app.get('/models', async (req, res) => {
      const result = await modelCollection.find().toArray();
      res.send(result);
    });

    // Get model by id
    app.get('/models/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const model = await modelCollection.findOne({ _id: new ObjectId(id) });
        if (!model) return res.status(404).send({ success: false, message: "Model not found" });
        res.send(model);
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    app.post('/models', async (req, res) => {
      const data = req.body;
      const result = await modelCollection.insertOne(data);
      res.send({ success: true, result });
    });

    // Search models
    app.get('/search', async (req, res) => {
      const searchText = req.query.search || "";
      const query = searchText
        ? { $or: [{ title: { $regex: searchText, $options: "i" } }, { category: { $regex: searchText, $options: "i" } }] }
        : {};
      const result = await modelCollection.find(query).toArray();
      res.send({ success: true, total: result.length, data: result });
    });

    /** ===== FOODS ROUTES ===== **/

    app.get("/foods", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.status(400).send({ success: false, message: "Email is required" });

        const foods = await modelCollection.find({ email: email }).toArray();
        console.log(email)
        res.send(foods);
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    // Get single food by id
    app.get("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const food = await foodsCollection.findOne({ _id: new ObjectId(id) });
        if (!food) return res.status(404).send({ success: false, message: "Food not found" });
        res.send(food);
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    // Add new food
    app.post("/foods", async (req, res) => {
      try {
        const data = req.body;
        const result = await foodsCollection.insertOne(data);
        res.send({ success: true, result });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

app.put("/foods/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    console.log(data)

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }

    const result = await modelCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ success: false, message: "Food not found" });
    }
    const updatedFood = await modelCollection.findOne({ _id: new ObjectId(id) });
    res.send({ success: true, data: updatedFood })


  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Server error" });
  }
});

    // Delete food
    app.delete("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await modelCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } finally {
    // client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => { res.send('Server is running'); });
app.listen(port, () => { console.log(`Server listening on port ${port}`); });



