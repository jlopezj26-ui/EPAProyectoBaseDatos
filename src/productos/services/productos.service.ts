import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from '../dtos/create-producto.dto';
import { UpdateProductoDto } from '../dtos/update-producto.dto';
import { IProducto } from '../interfaces/producto.interface';
import { IProductosService } from '../interfaces/productos-service.interface';

@Injectable()
export class ProductosService implements IProductosService {
  private readonly productos = new Map<number, IProducto>();
  private nextId = 1;

  create(createProductoDto: CreateProductoDto): IProducto {
    const producto: IProducto = {
      id: this.nextId++,
      ...createProductoDto,
    };
    this.productos.set(producto.id, producto);
    return producto;
  }

  findAll(): IProducto[] {
    return [...this.productos.values()];
  }

  findOne(id: number): IProducto {
    const producto = this.productos.get(id);
    if (!producto) {
      throw new NotFoundException(`No existe el producto con ID ${id}`);
    }
    return producto;
  }

  update(id: number, updateProductoDto: UpdateProductoDto): IProducto {
    const producto = this.findOne(id);
    const productoActualizado = { ...producto, ...updateProductoDto };
    this.productos.set(id, productoActualizado);
    return productoActualizado;
  }

  remove(id: number): void {
    this.findOne(id);
    this.productos.delete(id);
  }
}