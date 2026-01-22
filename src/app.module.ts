import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './modules/health/health.module';
import { PolicyModule } from './modules/policy/policy.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule, HealthModule, PolicyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
