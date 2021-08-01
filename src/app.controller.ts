import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';

const ackErrors: string[] = ['E11000'];

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private readonly logger = new Logger(AppController.name);
}
