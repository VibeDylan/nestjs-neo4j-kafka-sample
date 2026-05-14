import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  nom: string;

  @IsNumber()
  @Min(0)
  prix: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  categorieId?: string;

  @IsString()
  @IsOptional()
  marqueId?: string;
}