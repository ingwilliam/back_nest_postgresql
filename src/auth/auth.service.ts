import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'
import { LoginUserDto,CreateUserDto } from './dto/';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService')

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService:JwtService
  ){

  }

  async create(CreateUserDto: CreateUserDto) {

    try {

      const {password,...userData} = CreateUserDto;
      const user = this.userRepository.create({
        ...userData,
        password:bcrypt.hashSync(password,10)
      });

      await this.userRepository.save(user);

      delete user.password;

      return {
        ...user,
        token:this.getJwtToken({ email:user.email,id:user.id })
      };

    } catch (error) {
      this.handleDBExceptions(error);        
    }

    
  }

  async checkAuthStatus(user:User){

    return {
      ...user,
      token:this.getJwtToken({ email:user.email,id:user.id })
    };

  }


  async login(loginUserDto:LoginUserDto){

    const {password,email} = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {email},
      select: {email:true,password:true,id:true}
    });

    if(!user){
      throw new UnauthorizedException('Credenciales no son validas')
    }

    if(!bcrypt.compareSync(password,user.password)){
      throw new UnauthorizedException('Credenciales no son validas')
    }

    return {
      ...user,
      token:this.getJwtToken({ email:user.email,id:user.id })
    };

  } 

  private getJwtToken(payload:JwtPayload){
    
    const token = this.jwtService.sign(payload);
    return token;


  }

  private handleDBExceptions(error: any):never {

    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }
  
}
