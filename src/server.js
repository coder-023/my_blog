const express=require('express');
const bodyParser = require('body-parser');
const path=require('path');
const app=express();
const MongoClient=require('mongodb').MongoClient;
app.use(express.static(path.join(__dirname,'/build')));
app.use(bodyParser.json());
const uri="mongodb://localhost:27017";


const Initialize=async()=>{
  // console.log(articleName);
  const client=new MongoClient(uri,{useUnifiedTopology:true});
  try{
    await client.connect();
    const database=client.db('blogs');
    const my_blog=database.collection('articles');
    return my_blog;

  }
  catch(err){
    console.log(err);
  }
  await client.close()
}

const findingOne=async(my_blog,articleName)=>{
return my_blog.findOne({name:articleName});
}

app.get('/',(req,res)=>{
  res.send("Hello World!");

});

//TODO: Integrate the repeated code into a single function and use its functionality in the required place
app.post('/api/articles/:name/upvote',async(req,res)=>{
    const articleName=req.params.name;
    const my_blog= await Initialize();
    const imp_update= await findingOne(my_blog,articleName);
    await my_blog.updateOne({name:articleName},{
    $set:{
          "upvotes":imp_update.upvotes+1
        }
      });
    const updatedUpvote=await findingOne(my_blog,articleName);
    // console.log(updatedUpvote);
    res.status(200).send(updatedUpvote);
    

     }
)

app.post('/api/articles/:name/downvote',async(req,res)=>{
  const articleName=req.params.name;
  const my_blog=await Initialize();
  const imp_update=await findingOne(my_blog,articleName);
  if(imp_update.upvotes===0){
    res.status(400).send("Bad Request!");
    
  }
  else{
    await my_blog.updateOne({name:articleName},{
      $set:{upvotes:imp_update.upvotes-1}
    });
    const updatedDownvote=await findingOne(my_blog,articleName);
    console.log(updatedDownvote);
    res.status(200).send(updatedDownvote);
  }
  
})

app.get('/api/articles/:name',async (req,res)=>{
  console.log("Hello");
  const articleName=req.params.name;
  const my_blog=await Initialize();
  const blog=await findingOne(my_blog,articleName);
  console.log(blog);
  res.status(200).json(blog);
 })
   
     
app.post('/api/articles/:name/add-comment',async (req,res)=>{
  const {username, text}=req.body;
  const articleName=req.params.name;
  const collection= await Initialize();//accessing the collection
  const change=findingOne(collection,articleName);
  await collection.updateOne({name:articleName},{
          $push:{comments:{
            "username":username,
            "text":text
          }}})
  const updatedQuery=await findingOne(collection,articleName);
  console.log(updatedQuery);
  res.status(200).json(updatedQuery);
});
app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'/build/index.html'));
})
app.listen(8000,()=>console.log("Listening on port 8000"));
