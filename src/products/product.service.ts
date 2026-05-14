import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../neo4j/repositories/product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 as uuidv4 } from 'uuid';
import { KafkaService } from 'src/kafka/kakfa.service';
import { TOPICS } from 'src/shared/constants/topics.constants';
@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductRepository,
    private kafkaService: KafkaService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const productId = uuidv4();

    const product = await this.productRepository.create({
      id: productId,
      ...createProductDto,
    });

    if (createProductDto.categorieId) {
      await this.productRepository.linkToCategory(
        productId,
        createProductDto.categorieId,
      );
    }
    
    await this.kafkaService.publish(TOPICS.PRODUCT_CREATED, {
      type: 'PRODUCT_CREATED',
      timestamp: Date.now(),
      data: product,
    });

    return product;
  }

  async findAll() {
    return this.productRepository.findAll();
  }

  async findOne(id: string) {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundException(`Produit ${id} non trouvé`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // 1. Vérifier que le produit existe
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Produit ${id} non trouvé`);
    }

    const updated = await this.productRepository.update(id, updateProductDto);

    await this.kafkaService.publish(TOPICS.PRODUCT_UPDATED, {
      type: 'PRODUCT_UPDATED',
      timestamp: Date.now(),
      data: {
        id,
        changes: updateProductDto,
      },
    });

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.productRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Produit ${id} non trouvé`);
    }

    await this.kafkaService.publish(TOPICS.PRODUCT_DELETED, {
      type: 'PRODUCT_DELETED',
      timestamp: Date.now(),
      data: { id },
    });

    return { message: 'Produit supprimé', id };
  }

  async findSimilar(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Produit ${id} non trouvé`);
    }

    return this.productRepository.findSimilar(id);
  }

  async findCompatible(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Produit ${id} non trouvé`);
    }

    return this.productRepository.findCompatible(id);
  }
}