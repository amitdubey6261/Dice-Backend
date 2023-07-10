import express from 'express' ; 
import {createServer} from 'http' ; 
import {Server} from 'socket.io';
import dotenv from 'dotenv'; 
import path from 'path';
import cors from 'cors'; 

//my imports 


class SocketServer{
    constructor(){
        this.setunCaughtException();
        this.setMiddleWares();
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

        this.roomData = {} ; 

        this.io.on('connection' , (socket)=>{
            console.log(`Connected SocketID:${socket.id}`);

            socket.on('create_room' , (roomId)=>{
                socket.join(roomId);
                socket.emit('created_room' , roomId ); 
            })

            socket.on( 'join_room' , (roomId)=>{ 
                if( ! this.io.sockets.adapter.rooms.has(roomId) ){
                    socket.emit('Error' , "Not Found Room ") ; 
                }
                else{
                    if( this.io.sockets.adapter.rooms.get(roomId).size > 3 ){
                        console.log('ROOOM LIMIT REACH') ; 
                        socket.emit('Error' , 'room in maximum limit'); 
                    }
                    else{
                        socket.join(roomId);
                        console.log('andar' , socket.id , this.io.sockets.adapter.rooms.get(roomId).size ) ; 
                        if( this.io.sockets.adapter.rooms.get(roomId).size === 2 ){
                            console.log(`4 users joined in a ${roomId}`) ; 
                            console.log('start');

                            this.roomData[roomId] = this.getDefaultPosition() ; 

                            console.log(this.roomData[roomId]) ; 




                        }
                    }
                }
            })
        })

        this.httpServer.listen(process.env.PORT , ()=>{
            console.log(`App started listening on port ${process.env.PORT}`) ; 
        })
    }

    getDefaultPosition(){
        const tokens = new Array();
        const defaultTokenPosition = [ [3,3] , [3,12] , [11,12] , [11,3] ] ; 
        for (let i = 0; i < 4; i++) {
            const tokenArray = new Array(4).fill({ position: { x: defaultTokenPosition[i][0], y: defaultTokenPosition[i][1], z: 1 } });
            tokens.push(tokenArray);
        }

        return tokens ; 
    }
}

const server = new SocketServer() ; 