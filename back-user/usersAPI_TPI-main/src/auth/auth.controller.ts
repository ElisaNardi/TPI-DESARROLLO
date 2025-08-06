import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from '../interfaces/register.dto';
import { LoginDTO } from '../interfaces/login.dto';
import { Public } from '../middlewares/decorators/public.decorator'; // ✅ Importamos el decorador @Public

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // ✅ Ruta pública: no requiere token para registrar usuario
  @Post('register')
  async register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }

  @Public() // ✅ Ruta pública: no requiere token para loguearse
  @Post('login')
  async login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  // Este sí puede requerir token si querés, así que lo dejamos sin @Public()
  @Post('refresh')
  async refresh(@Body('refresh_token') token: string) {
    return this.authService.refresh(token);
  }
}
