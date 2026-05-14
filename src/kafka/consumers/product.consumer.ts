import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../neo4j/repositories/product.repository';
import { KafkaService } from '../kakfa.service';
import { TOPICS } from 'src/shared/constants/topics.constants';

@Injectable()
export class ProductConsumer {
  constructor(
    private kafkaService: KafkaService,
    private productRepository: ProductRepository,
  ) {
    this.kafkaService.registerSubscription(
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