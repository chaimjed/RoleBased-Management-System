import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateExportDto {
  @ApiPropertyOptional()
  @IsOptional() 
  @IsString() 
  search?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  role?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  status?: string;
  
  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  joinedAfter?: string;
}
