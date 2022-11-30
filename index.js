require('dotenv').config();
const express = require('express');
const mongoose =require('mongoose');
const nanoid = require('nanoid');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

mongoose.connect("mongodb://Shriramu:akila2002@ac-xtkle9l-shard-00-00.bmgakwa.mongodb.net:27017,ac-xtkle9l-shard-00-01.bmgakwa.mongodb.net:27017,ac-xtkle9l-shard-00-02.bmgakwa.mongodb.net:27017/?ssl=true&replicaSet=atlas-enf3zy-shard-0&authSource=admin&retryWrites=true&w=majority");
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error: "));
db.once("open", function () {
    console.log("Database Connected successfully");
})

const urlSchema = new mongoose.Schema({
  original_url:{type:String,required:true},
  short_url:{type:String,required:true,unique:true}
});

const Url = new mongoose.model("url",urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl',function(req,res){
  let i_url =req.body.url;
  const regex = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
  if(regex.test(i_url)){
  let s_url = nanoid(5);
  let n_url = new Url({
    original_url:i_url,
    short_url:s_url
  });

   n_url.save(function(err,data){
    if(err){
      console.log(err);
    }
    else{
      res.json({
        original_url:data.original_url,
        short_url:data.short_url
      });
    }
  });
  }
  else{
    res.json({
      error:"invalid url"
    })
  }
});

app.get("/api/shorturl/:surl",async function(req,res){
  let s_url = req.params.surl;
  let data = await Url.findOne({short_url:s_url});
  if(data){
    res.redirect(data.original_url);
  }
  else{
    res.json({error:"invalid url"});
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
