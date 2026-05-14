import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka!: Kafka;
  private producer!: Producer;
  private consumer!: Consumer;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const config = this.configService.get('kafka');

    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
    });

    this.producer = this.kafka.producer();
    await this.producer.connect();
    console.log('✅ Kafka Producer connecté');

    this.consumer = this.kafka.consumer({ 
      groupId: config.groupId 
    });
    await this.consumer.connect();
    console.log('✅ Kafka Consumer connecté');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
    console.log('Kafka connexions fermées');
  }

  async publish(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.id || null,
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });
      console.log(`✅ Événement publié sur ${topic}:`, message.type);
    } catch (error) {
      console.error(`❌ Erreur publication Kafka:`, error);
      throw error;
    }
  }

  async subscribe(topic: string, handler: (payload: EachMessagePayload) => Promise<void>) {
    await this.consumer.subscribe({ topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async (payload) => {
        try {
          console.log(`📨 Événement reçu de ${payload.topic}`);
          await handler(payload);
        } catch (error) {
          console.error('❌ Erreur traitement message:', error);
          // TODO: Dead Letter Queue
        }
      },
    });

    console.log(`👂 Écoute sur le topic: ${topic}`);
  }
}