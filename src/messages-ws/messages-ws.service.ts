import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients{
    [id:string]:{
        socket:Socket,
        user:User,
    }
}

@Injectable()
export class MessagesWsService {

    private connectedClients:ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    async registerClient(client:Socket,userId:string){
        const user = await this.userRepository.findOneBy({id:userId});
        if(!user){
            throw new Error ('El usuario no existe');
        }
        if(!user.isActive){
            throw new Error ('El usuario no esta activo');
        }
        this.ckeckUserConnection(user);
        this.connectedClients[client.id] = {
            socket:client,
            user
        };
    };


    removeClient(clientId:string){
        delete this.connectedClients[clientId];
    };

    getConnectedClients():string[]{
        //console.log(this.connectedClients);
        
        return Object.keys(this.connectedClients);
    }

    getUserFullName(socketId:string){
        return this.connectedClients[socketId].user.fullName;    
    }

    private ckeckUserConnection(user:User){
        for(const clientId of Object.keys(this.connectedClients)){
            const connectClient = this.connectedClients[clientId];
            if(connectClient.user.id==user.id){
                connectClient.socket.disconnect();
                break;
            }
        }

    }


}
