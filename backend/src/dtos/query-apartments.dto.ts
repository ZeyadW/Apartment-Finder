import { IsOptional, IsString, IsNumber, IsBoolean, Min, Max, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryApartmentsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Search term cannot be empty' })
  search?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Listing type cannot be empty' })
  listingType?: 'rent' | 'sale';

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Min price must be a valid number' })
  @Min(0, { message: 'Min price must be at least 0' })
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Max price must be a valid number' })
  @Min(0, { message: 'Max price must be at least 0' })
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Bedrooms must be a valid number' })
  @Min(0, { message: 'Bedrooms must be at least 0' })
  @Max(10, { message: 'Bedrooms cannot exceed 10' })
  bedrooms?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Bathrooms must be a valid number' })
  @Min(0, { message: 'Bathrooms must be at least 0' })
  @Max(10, { message: 'Bathrooms cannot exceed 10' })
  bathrooms?: number;

  @IsOptional()
  @IsString({ message: 'City must be a valid string' })
  @IsNotEmpty({ message: 'City cannot be empty' })
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  compoundName?: string;

  @IsOptional()
  @IsString()
  developerName?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Min square feet must be a valid number' })
  @Min(0, { message: 'Min square feet must be at least 0' })
  minSquareFeet?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Max square feet must be a valid number' })
  @Min(0, { message: 'Max square feet must be at least 0' })
  maxSquareFeet?: number;
}