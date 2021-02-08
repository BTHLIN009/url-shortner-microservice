require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let mongoose=require("mongoose");
let bodyParser=require("body-parser")
let urlParser=require('url')

let dns=require('dns')


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

//random Url key generator
//let r = Math.random().toString(36).substring(5);
//console.log("random", r);



let uri=process.env.DB_URI;



mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let urlSchema=new mongoose.Schema({
  original: String,
  shortened: String
},{collection: 'urls'})

let Url=mongoose.model('Url', urlSchema)
let resp={}// 

//https://www.freecodecamp.org
//https://www.google.com
app.post('/api/shorturl/new',bodyParser.urlencoded({extended: false}),(request, response)=>{
  let urlInput=request.body['url']
  dns.lookup(urlParser.parse(urlInput).hostname, (error, address)=>{
    if(!address){
        response.json({error: "Invalid URL"})
      } else{
        let short=Math.random().toString(36).substring(6)
        Url.findOneAndUpdate({original: urlInput},{original: urlInput, shortened: short} , {new: true, upsert: true},(error,data)=>{
          if(error){
            console.log(error)
          } else{
            console.log(data)
            //data.save()
          }
        });
      
      //console.log(short)
      resp['original_url']=urlInput;
      resp['short_url']=short;
      response.json(resp)

      }
  })
})




app.get('/api/shorturl/:input',(request, response)=>{
  let input=request.params.input
  console.log(input)
  Url.find({shortened: input}, (error,data)=>{
    if( error || data===[]){
      response.json({error: "Invalid URL"})
    } else{
      let original=data[0]
      original=original.original
      console.log(original)
      response.redirect(original)

    }
  })
  }
)
