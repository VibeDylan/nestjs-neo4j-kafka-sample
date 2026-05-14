import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver!: Driver;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const config = this.configService.get('neo4j');
    
    // Créer la connexion Neo4j
    this.driver = neo4j.driver(
      `${config.scheme}://${config.host}:${config.port}`,
      neo4j.auth.basic(config.username, config.password),
    );

    try {
      await this.driver.verifyConnectivity();
      console.log('✅ Connecté à Neo4j');
    } catch (error) {
      console.error('❌ Erreur connexion Neo4j:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.driver.close();
    console.log('Neo4j connexion fermée');
  }

  getSession(): Session {
    return this.driver.session({
      database: this.configService.get('neo4j.database'),
    });
  }

  async read(cypher: string, params: any = {}) {
    const session = this.getSession();
    try {
      const result = await session.executeRead((tx) =>
        tx.run(cypher, params),
      );
      return result.records.map((record) => record.toObject());
    } finally {
      await session.close();
    }
  }

  async write(cypher: string, params: any = {}) {
    const session = this.getSession();
    try {
      const result = await session.executeWrite((tx) =>
        tx.run(cypher, params),
      );
      return result.records.map((record) => record.toObject());
    } finally {
      await session.close();
    }
  }
}