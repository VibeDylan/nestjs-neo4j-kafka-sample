import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  clientId: process.env.KAFKA_CLIENT_ID || 'knowledge-graph-service',
  groupId: process.env.KAFKA_GROUP_ID || 'kg-consumer-group',
}));