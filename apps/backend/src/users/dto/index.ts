import { IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength, Matches, IsBoolean, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsString({ message: 'Password harus berupa string' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @MaxLength(100, { message: 'Password maksimal 100 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
    message: 'Password harus mengandung minimal 1 huruf kecil, 1 huruf besar, dan 1 angka' 
  })
  password: string;

  @IsString({ message: 'Nama harus berupa string' })
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  name: string;

  @IsString({ message: 'Nomor telepon harus berupa string' })
  @IsOptional()
  @MaxLength(20, { message: 'Nomor telepon maksimal 20 karakter' })
  phone?: string;

  @IsEnum(UserRole, { message: 'Role tidak valid' })
  @IsOptional()
  role?: UserRole;

  @IsString({ message: 'Cabang harus berupa string' })
  @IsOptional()
  branchId?: string;

  @IsString({ message: 'PIN harus berupa string' })
  @IsOptional()
  @MinLength(4, { message: 'PIN minimal 4 digit' })
  @MaxLength(4, { message: 'PIN maksimal 4 digit' })
  pin?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString({ message: 'Rate komisi harus berupa string' })
  @IsOptional()
  @Matches(/^\d+(\.\d{1,4})?$/, { message: 'Rate komisi harus berupa angka desimal, contoh: 0.05' })
  commissionRate?: string;
}

export class UpdateUserDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Password harus berupa string' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @IsOptional()
  password?: string;

  @IsString({ message: 'Nama harus berupa string' })
  @IsOptional()
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  name?: string;

  @IsString({ message: 'Nomor telepon harus berupa string' })
  @IsOptional()
  @MaxLength(20, { message: 'Nomor telepon maksimal 20 karakter' })
  phone?: string;

  @IsEnum(UserRole, { message: 'Role tidak valid' })
  @IsOptional()
  role?: UserRole;

  @IsString({ message: 'Cabang harus berupa string' })
  @IsOptional()
  branchId?: string;

  @IsString({ message: 'PIN harus berupa string' })
  @IsOptional()
  @MinLength(4, { message: 'PIN minimal 4 digit' })
  @MaxLength(4, { message: 'PIN maksimal 4 digit' })
  pin?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString({ message: 'Rate komisi harus berupa string' })
  @IsOptional()
  @Matches(/^\d+(\.\d{1,4})?$/, { message: 'Rate komisi harus berupa angka desimal, contoh: 0.05' })
  commissionRate?: string;
}
