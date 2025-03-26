import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAdmins(): Promise<User[]> {
    return this.usersRepository.find({ where: { role: UserRole.ADMIN } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
    );

    const user = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role,
    });

    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    const updateData: Partial<User> = {
      ...updateUserDto,
    };

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(
        updateUserDto.password,
        parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
      );
    }

    if (updateUserDto.role) {
      updateData.role = updateUserDto.role;
    }

    return this.usersRepository.save({
      ...user,
      ...updateData,
    });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
