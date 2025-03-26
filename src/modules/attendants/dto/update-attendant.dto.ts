import { PartialType } from '@nestjs/swagger';
import { CreateAttendantDto } from './create-attendant.dto';

export class UpdateAttendantDto extends PartialType(CreateAttendantDto) {}
