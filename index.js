const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.60cwtg1.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    const usersCollection = client.db('admDB').collection('users')
    const collegesCollection = client.db('admDB').collection('colleges')
    const admissionCollection = client.db('admDB').collection('admissions')

    // user api
      app.put('/users/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const query = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      }
      const result = await usersCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })

    // get user
      app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const result = await usersCollection.findOne(query);
      res.send(result)
    })

    // get to db in all colleges data
    app.get('/colleges', async(req, res)=>{
        const result = await collegesCollection.find().toArray();
        res.send(result)
    })

    // get top rated collage
    app.get('/colleges/best', async(req, res)=>{
        const result = await collegesCollection.find().sort({rating: -1}).limit(3).toArray();
        res.send(result)
    })
    // get  single collage information
    app.get('/colleges/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await collegesCollection.findOne(query);
        res.send(result)
    })

    // admission collection

      app.put('/admission/:email', async (req, res) => {
      const email = req.params.email
      const admissionInfo = req.body
      const query = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          email: email,
          collegeId: admissionInfo.collegeId,
          college: admissionInfo.college,
          studentInfo: admissionInfo.studentInfo
        }
      }
      const result = await usersCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })
    
    app.get('/admission/:email', async (req, res) =>{
      const email = req.email;
      const query = {email: email};
      const result = await admissionCollection.findOne(query);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send(' Server is running..')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})