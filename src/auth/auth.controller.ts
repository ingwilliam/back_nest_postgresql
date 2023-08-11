import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto , LoginUserDto } from './dto/';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { GetUser } from './decorator/get-user.decorator';
import { User } from './entities/user.entity';
import { IncomingHttpHeaders } from 'http';
import { RawHeaders } from '../common/decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from 'src/common/decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-role';
import { Auth } from './decorator/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  crearUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('ckeck-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user:User,    
    ) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @Req() request: Request,
    @GetUser() user:User,    
    @GetUser('email') userEmail:String,  
    @RawHeaders() rawHeaders:string[], 
    @Headers() headers: IncomingHttpHeaders
  ){
    return {
      msg:'Hola JWT',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }

  @Get('private2')
  @SetMetadata('roles',['admin','super_user','user'])
  @UseGuards( AuthGuard(),UserRoleGuard )
  testingPrivateRoute2(
    @GetUser() user:User,    
  ){

    return {
      msg:'Hola JWT',
      user
    }
  }

  @Get('private3') 
  @RoleProtected(ValidRoles.user,ValidRoles.admin)
  @UseGuards( AuthGuard(),UserRoleGuard )
  testingPrivateRoute3(
    @GetUser() user:User,    
  ){

    return {
      msg:'Hola JWT',
      user
    }
  }

  @Get('private4')   
  @Auth(ValidRoles.admin)
  testingPrivateRoute4(
    @GetUser() user:User,    
  ){

    return {
      msg:'Hola JWT',
      user
    }
  }


  
}
