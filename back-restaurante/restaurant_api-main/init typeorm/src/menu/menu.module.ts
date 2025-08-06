
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from '../entities/menu/menu.entity';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu]),
    forwardRef(() => RestaurantModule),
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [TypeOrmModule, MenuService]
})
export class MenuModule {}