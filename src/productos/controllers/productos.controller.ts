import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductoDto } from '../dtos/create-producto.dto';
import { UpdateProductoDto } from '../dtos/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { IProducto } from '../interfaces/producto.interface';
import {
  IProductosService,
  PRODUCTOS_SERVICE,
} from '../interfaces/productos-service.interface';

@ApiTags('productos')
@Controller('productos')
export class ProductosController {
  constructor(
    @Inject(PRODUCTOS_SERVICE)
    private readonly productosService: IProductosService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiCreatedResponse({ type: Producto })
  create(@Body() createProductoDto: CreateProductoDto): IProducto {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos' })
  @ApiOkResponse({ type: Producto, isArray: true })
  findAll(): IProducto[] {
    return this.productosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiOkResponse({ type: Producto })
  @ApiNotFoundResponse({ description: 'Producto no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): IProducto {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiOkResponse({ type: Producto })
  @ApiNotFoundResponse({ description: 'Producto no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ): IProducto {
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiNoContentResponse({ description: 'Producto eliminado' })
  @ApiNotFoundResponse({ description: 'Producto no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.productosService.remove(id);
  }
}