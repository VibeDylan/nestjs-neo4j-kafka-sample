import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import neo4jConfig from '../config/neo4j.config';
import { Neo4jService } from './neo4j.service';
import { ProductRepository } from './repositories/product.repository';

@Module({
  imports: [ConfigModule.forFeature(neo4jConfig)],
  providers: [Neo4jService, ProductRepository],
  exports: [Neo4jService, ProductRepository],
})
export class Neo4jModule {}