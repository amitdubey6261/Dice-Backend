import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

//my imports 


class SocketServer {
    constructor() {
        this.setunCaughtException();
        this.setMiddleWares();
        this.createSocketServer();
    }

    setMiddleWares() {
        dotenv.config({ path: './config/config.env' });
    }

    setunCaughtException() {
        process.on('uncaughtException', (e) => {
            console.log(e.message);
            console.log(`Shutting down server due to uncaught exception error`);
            process.exit(1);
        })
    }

    createSocketServer() {
        const app = express();
        app.use(express.json());
        app.use(cors());

        this.httpServer = createServer(app);
        this.io = new Server(this.httpServer, { cors: {}, maxHttpBufferSize: 1e8 });

        this.roomData = {};

        this.io.on('connection', (socket) => {
            console.log(`Connected SocketID:${socket.id}`);

            socket.on('create_room', (roomId) => {
                const users = [ socket.id ];
                this.roomData[roomId] = { users };
                socket.join(roomId);
                socket.emit('created_room', roomId);

                f(roomId , socket );
            })

            socket.on('join_room', (roomId) => {
                if (!this.io.sockets.adapter.rooms.has(roomId)) {
                    socket.emit('Error', "Not Found Room ");
                }
                else {
                    if (this.io.sockets.adapter.rooms.get(roomId).size > 3) {
                        console.log('ROOOM LIMIT REACH');
                        socket.emit('Error', 'room in maximum limit');
                    }
                    else {
                        const userValue = this.roomData[roomId]
                        socket.join(roomId);
                        socket.emit('joined_room', roomId);
                        console.log('andar', socket.id, this.io.sockets.adapter.rooms.get(roomId).size);
                        if (this.io.sockets.adapter.rooms.get(roomId).size === 2) {
                            console.log(`4 users joined in a ${roomId}`);
                            console.log('start');

                            const data = { userTurn: 0 }

                            this.roomData[roomId] = data;
                        }
                    }
                }
            })

            socket.on('dice_data', (data) => {
                console.log(data); //data.room
                socket.broadcast.to(data.room).emit('dice_update', data);
            })

            socket.on('user_change', (data) => {
                //e room id , user turn 
                const newUser = data;
                socket.broadcast.to(data.room).emit('user_update', newUser);
            })
        })

        const f = (roomid ) => {
            setInterval(() => {
                console.log(this.io.sockets.rooms )
            }, 1000);
        }


        this.httpServer.listen(process.env.PORT, () => {
            console.log(`App started listening on port ${process.env.PORT}`);
        })
    }
}

const server = new SocketServer(); 