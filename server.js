import express from 'express' ; 
import {createServer} from 'http' ; 
import {Server} from 'socket.io';
import dotenv from 'dotenv'; 
import path from 'path';
import cors from 'cors'; 

//my imports 
import Hello from './SocketModule/Hello.js' ; 


class SocketServer{
    constructor(){
        this.setunCaughtException();
        this.setMiddleWares();

        this.hello = new Hello() ; 
        this.createSocketServer() ; 
    }

    setMiddleWares(){
        dotenv.config({path : './config/config.env'});
    }

    setunCaughtException(){
        process.on('uncaughtException' , (e)=>{
            console.log(e.message);
            console.log(`Shutting down server due to uncaught exception error`);
            process.exit(1);
        })
    }
    
    createSocketServer(){
        const app = express() ;
        app.use(express.json()); 
        app.use(cors());

        this.httpServer = createServer(app) ;
        this.io = new Server( this.httpServer , { cors : {} , maxHttpBufferSize : 1e8 }) ; 

        this.io.on('connection' , (socket)=>{
            console.log(`Connection Successfull ` , socket.id ) ; 
            socket.on('HELLO' , this.hello.boloHello ) ; 
        })

        this.httpServer.listen(process.env.PORT , ()=>{
            `App started listening on port ${process.env.PORT}`
        })

        app.get('*' , (req , res)=>{
            res.send('Hello');
        })
    }
}

const server = new SocketServer() ; 