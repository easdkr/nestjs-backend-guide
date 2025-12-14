import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { JwtAuthGuard } from '@api/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@api/auth/guards/roles.guard';
import { Roles } from '@api/auth/decorators/roles.decorator';
import { Role } from '@api/user/core/role.enum';

@Controller({ version: '1', path: 'products' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductV1Controller {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async create(@Body() body: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productService.create(body);
    return ProductResponseDto.from(product);
  }
}
