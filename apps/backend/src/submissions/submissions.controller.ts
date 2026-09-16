import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubmissionsService } from './submissions.service';

@Controller('submissions')
@UseGuards(AuthGuard('jwt'))
export class SubmissionsController {
  constructor(private submissionsService: SubmissionsService) {}

  @Get('me')
  getMySubmissions(@Request() req) {
    return this.submissionsService.getUserSubmissions(req.user.id);
  }
}
