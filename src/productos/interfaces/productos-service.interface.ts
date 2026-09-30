import { CreateProductoDto } from '../dtos/create-producto.dto';
import { UpdateProductoDto } from '../dtos/update-producto.dto';
import { IProducto } from './producto.interface';

export const PRODUCTOS_SERVICE = Symbol('PRODUCTOS_SERVICE');

export interface IProductosService {
  create(createProductoDto: CreateProductoDto): IProducto;
  findAll(): IProducto[];
  findOne(id: number): IProducto;
  update(id: number, updateProductoDto: UpdateProductoDto): IProducto;
  remove(id: number): void;
}