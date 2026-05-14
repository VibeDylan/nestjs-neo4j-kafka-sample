import { Module } from '@nestjs/common';
import { Neo4jModule } from '../neo4j/neo4j.module';
import { KafkaModule } from '../kafka/kafka.module';
import { ProductsController } from './product.controller';
import { ProductsService } from './product.service';

@Module({
  imports: [Neo4jModule, KafkaModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}