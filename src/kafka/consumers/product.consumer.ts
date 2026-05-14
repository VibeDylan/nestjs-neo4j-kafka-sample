import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProductRepository } from '../../neo4j/repositories/product.repository';
import { TOPICS } from '../../shared/constants/topics.constants';
import { KafkaService } from '../kakfa.service';

@Injectable()
export class ProductConsumer implements OnModuleInit {
  constructor(
    private kafkaService: KafkaService,
    private productRepository: ProductRepository,
  ) {}

  async onModuleInit() {
    await this.kafkaService.subscribe(
      TOPICS.PRODUCT_UPDATED,
      this.handleProductUpdated.bind(this),
    );
  }

  private async handleProductUpdated(payload: any) {
    const message = JSON.parse(payload.message.value.toString());

    console.log('🔄 Mise à jour produit:', message);

    try {
      await this.productRepository.update(message.data.id, message.data.changes);
      console.log(`✅ Produit ${message.data.id} mis à jour dans Neo4j`);
    } catch (error) {
      console.error(`❌ Erreur mise à jour produit:`, error);
      throw error;
    }
  }
}