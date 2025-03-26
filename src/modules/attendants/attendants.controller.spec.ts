import { Test, TestingModule } from '@nestjs/testing';
import { AttendantsController } from './attendants.controller';

describe('AttendantsController', () => {
  let controller: AttendantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendantsController],
    }).compile();

    controller = module.get<AttendantsController>(AttendantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
