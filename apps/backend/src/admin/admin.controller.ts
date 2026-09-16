import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Header, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Prohibited actions: Rounds and Challenges cannot be created or edited by admin
  @Post('rounds')
  createRound() {
    throw new ForbiddenException('Round management and creation is restricted.');
  }

  @Put('rounds/:id/status')
  updateRoundStatus() {
    throw new ForbiddenException('Round status modification is restricted.');
  }

  @Delete('rounds/:id')
  deleteRound() {
    throw new ForbiddenException('Round deletion is restricted.');
  }

  @Post('challenges')
  createChallenge() {
    throw new ForbiddenException('Challenge creation is restricted.');
  }

  @Put('challenges/:id')
  updateChallenge() {
    throw new ForbiddenException('Challenge editing is restricted.');
  }

  @Delete('challenges/:id')
  deleteChallenge() {
    throw new ForbiddenException('Challenge deletion is restricted.');
  }

  // Users
  @Put('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.adminService.updateUserRole(id, role);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Statistics
  @Get('stats')
  getStatistics() {
    return this.adminService.getStatistics();
  }

  @Get('submissions')
  getAllSubmissions() {
    return this.adminService.getAllSubmissions();
  }

  @Post('reset')
  resetCompetition() {
    return this.adminService.resetCompetition();
  }

  // Team & Score Management
  @Post('teams/:id/adjust-score')
  adjustTeamScore(
    @Param('id') id: string,
    @Body('points') points: number,
    @Body('reason') reason: string,
  ) {
    return this.adminService.adjustTeamScore(id, points, reason);
  }

  @Post('teams/:id/disqualify')
  disqualifyTeam(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.disqualifyTeam(id, reason);
  }

  @Post('teams/:id/re-enable')
  reEnableTeam(@Param('id') id: string) {
    return this.adminService.reEnableTeam(id);
  }

  @Post('teams/:id/freeze-score')
  freezeTeamScore(@Param('id') id: string, @Body('freeze') freeze: boolean) {
    return this.adminService.freezeTeamScore(id, Boolean(freeze));
  }

  @Post('teams/:id/qualify')
  qualifyTeam(@Param('id') id: string) {
    return this.adminService.qualifyTeam(id);
  }

  @Post('teams/qualify-top')
  qualifyTopTeams(@Body('count') count: number) {
    return this.adminService.qualifyTopTeams(count);
  }

  // Hint Management
  @Get('hints')
  getHintsOverview() {
    return this.adminService.getHintsOverview();
  }

  @Post('teams/:id/grant-hint')
  grantHint(
    @Param('id') id: string,
    @Body('challengeId') challengeId?: string,
    @Body('free') free: boolean = true,
  ) {
    return this.adminService.grantHint(id, challengeId, free);
  }

  @Post('teams/:id/reset-hints')
  resetTeamHints(
    @Param('id') id: string,
    @Body('challengeId') challengeId?: string,
    @Body('refundPoints') refundPoints: boolean = true,
  ) {
    return this.adminService.resetTeamHints(id, challengeId, refundPoints);
  }

  // Scoreboard Freeze (Whole Game)
  @Post('scoreboard/freeze')
  freezeScoreboard(@Body('freeze') freeze: boolean) {
    return this.adminService.freezeScoreboard(freeze);
  }

  @Get('export')
  exportResults() {
    return this.adminService.exportResults();
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="ctf-results.csv"')
  exportResultsCSV() {
    return this.adminService.exportResultsCSV();
  }

  // Game & Round Controls
  @Post('game/end')
  endGame() {
    return this.adminService.endGame();
  }

  @Post('game/resume')
  resumeGame() {
    return this.adminService.resumeGame();
  }

  @Post('rounds/activate-all')
  activateAllRounds() {
    return this.adminService.activateAllRounds();
  }
}
