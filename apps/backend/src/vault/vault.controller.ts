import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { VaultService } from './vault.service';
import { VerifyVaultLayerDto } from './dto/vault.dto';

@Controller('vault')
@UseGuards(AuthGuard('jwt'))
export class VaultController {
  constructor(private vaultService: VaultService) {}

  @Post('verify')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  verify(@Body() dto: VerifyVaultLayerDto, @Request() req) {
    return this.vaultService.verifyLayer(req.user.id, dto.layer, dto.value);
  }
}
