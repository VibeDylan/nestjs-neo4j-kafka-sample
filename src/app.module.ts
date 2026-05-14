import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { KafkaModule } from './kafka/kafka.module';
import { ProductsModule } from './products/product.module'; 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    Neo4jModule,
    KafkaModule,
    ProductsModule,
  ],
})
export class AppModule {}