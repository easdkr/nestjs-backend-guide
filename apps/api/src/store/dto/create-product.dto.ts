import {
  IsNumber,
  IsString,
  MinLength,
  IsBoolean,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOptionPriceDto {
  @IsNumber()
  @Min(1000, { message: '가격은 최소 1000 이상이어야 합니다.' })
  price: number;

  @IsOptional()
  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다.' })
  validFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다.' })
  validTo?: string;
}

export class CreateOptionDto {
  @IsString()
  @MinLength(1, { message: '옵션 이름은 필수입니다.' })
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionPriceDto)
  prices: CreateOptionPriceDto[];
}

export class CreateOptionGroupDto {
  @IsString()
  @MinLength(2, { message: '옵션 그룹 이름은 최소 2자 이상이어야 합니다.' })
  name: string;

  @IsBoolean()
  required: boolean;

  @IsArray()
  @ArrayMinSize(1, { message: '옵션은 최소 1개 이상이어야 합니다.' })
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}

export class CreateProductDto {
  @IsNumber()
  storeId: number;

  @IsString()
  @MinLength(2, { message: '상품 이름은 최소 2자 이상이어야 합니다.' })
  name: string;

  @IsArray()
  @ArrayMinSize(1, { message: '옵션 그룹은 최소 1개 이상이어야 합니다.' })
  @ValidateNested({ each: true })
  @Type(() => CreateOptionGroupDto)
  optionGroups: CreateOptionGroupDto[];
}
