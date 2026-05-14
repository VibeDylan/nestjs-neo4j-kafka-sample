import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import kafkaConfig from '../config/kafka.config';
import { ProductConsumer } from './consumers/product.consumer';
import { Neo4jModule } from '../neo4j/neo4j.module';
import { KafkaService } from './kakfa.service';

@Module({
  imports: [
    ConfigModule.forFeature(kafkaConfig),
    Neo4jModule,
  ],
  providers: [KafkaService, ProductConsumer],
  exports: [KafkaService],
})
export class KafkaModule {}