import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class AssignPermissionsDto {
  @ApiProperty({ example: ['users:read', 'users:edit'] })
  @IsArray()
  @IsString({ each: true })
  permissionNames!: string[]
}