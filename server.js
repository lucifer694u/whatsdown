import express from "express";
import mongoose from "mongoose";
import Messages from "./models/DBmessages.js";
import Pusher from "pusher";
import cors from "cors";
import Rooms from "./models/DBrooms.js";





const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1652387",
    key: "99034683c1429eea8d6f",
    secret: "486ddc714958b80669b7",
    cluster: "ap2",
    useTLS: true
  });

app.use(express.json())
app.use(cors());
// app.use((req,res,next)=>{
//     res.setHeader("Access-Control-Allow-Origin","*");
//     res.setHeader("Access-Control-Allow-Headers","*");
//     next(); 
// })

const connection_url="mongodb+srv://admin:KrVF2MrK3rYIHHZd@cluster0.apj3kda.mongodb.net/whatsdownDB?retryWrites=true&w=majority";
mongoose.connect(connection_url,{
    // useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
})

const db=mongoose.connection
db.once('open',()=>{
    console.log('DB connected');

    const msgCollection=db.collection("messages");
    const roomCollection=db.collection("rooms");

    const changeStream=msgCollection.watch();
    const changeStream2=roomCollection.watch();

    changeStream.on('change',(change)=>{
        console.log("A change ocuured",change);

        if(change.operationType === 'insert'){
            const messageDetails=change.fullDocument;
            pusher.trigger('messages','inserted',{
                roomID:messageDetails.roomID,
                name:messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                received:messageDetails.received
            });
        }else{
            console.log("Error triggering Pusher")
        }
    }) 
    changeStream2.on('change',(change)=>{
        console.log("A change ocuured",change);

        if(change.operationType === 'insert'){
            const roomDetails=change.fullDocument;
            pusher.trigger('rooms','inserted',{
                name:roomDetails.name,
                message:roomDetails.message
               
            });
        }else{
            console.log("Error triggering Pusher")
        }
    })

  
})

app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

app.get("/messages/sync",(req,res)=>{
    Messages.find({}).then(result=>{
        res.status(201).send(result)
    }).catch(err=>[
        res.status(500).send(err)
    ])
})

app.get("/rooms/sync",(req,res)=>{
    Rooms.find({}).then(result=>{
        res.status(201).send(result)
    }).catch(err=>[
        res.status(500).send(err)
    ])
})

app.get("/rooms/:id",(req,res)=>{
    Rooms.findById(req.params.id).then(result=>{
        res.status(200).json({
            name:result.name,
            image:result.image
        })
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    })
})

app.post('/messages/new',(req,res) => {
    const dbMessage = req.body

    Messages.create(dbMessage)
    .then(result => {
        res.status(201).send(`new message created: \n ${result}`)
    }).catch(err=>{
        res.status(500).send(err)
    })
})

app.post('/rooms/new',(req,res)=>{
   const dbRoom = req.body;
   Rooms.create(dbRoom)
   .then(result => {
       res.status(201).send(`new room created: \n ${result}`)
   }).catch(err=>{
       res.status(500).send(err)
   })
})


app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
