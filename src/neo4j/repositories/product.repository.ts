import { Injectable } from '@nestjs/common';
import neo4j from 'neo4j-driver';
import { Neo4jService } from '../neo4j.service';

@Injectable()
export class ProductRepository {
  constructor(private neo4jService: Neo4jService) {}

  async create(product: any) {
    const cypher = `
      CREATE (p:Produit {
        id: $id,
        nom: $nom,
        prix: $prix,
        stock: $stock,
        description: $description,
        created_at: datetime(),
        updated_at: datetime()
      })
      RETURN p
    `;

    const result = await this.neo4jService.write(cypher, product);
    return result[0]?.p;
  }

  async findById(id: string) {
    const cypher = `
      MATCH (p:Produit {id: $id})
      OPTIONAL MATCH (p)-[:EST_DE_CATEGORIE]->(c:Categorie)
      OPTIONAL MATCH (p)-[:A_MARQUE]->(m:Marque)
      RETURN p, c, m
    `;

    const result = await this.neo4jService.read(cypher, { id });
    
    if (result.length === 0) return null;

    return {
      ...result[0].p.properties,
      categorie: result[0].c?.properties,
      marque: result[0].m?.properties,
    };
  }

  async findAll(limit = 20) {
    const cypher = `
      MATCH (p:Produit)
      OPTIONAL MATCH (p)-[:EST_DE_CATEGORIE]->(c:Categorie)
      RETURN p, c
      LIMIT $limit
    `;

    const result = await this.neo4jService.read(cypher, { limit: neo4j.int(limit) });

    return result.map((record) => ({
      ...record.p.properties,
      categorie: record.c?.properties,
    }));
  }

  async update(id: string, updates: any) {
    // Construire dynamiquement le SET
    const setClause = Object.keys(updates)
      .map((key) => `p.${key} = $${key}`)
      .join(', ');

    const cypher = `
      MATCH (p:Produit {id: $id})
      SET ${setClause}, p.updated_at = datetime()
      RETURN p
    `;

    const result = await this.neo4jService.write(cypher, { id, ...updates });
    return result[0]?.p;
  }

  async delete(id: string) {
    const cypher = `
      MATCH (p:Produit {id: $id})
      DETACH DELETE p
      RETURN count(p) as deleted
    `;

    const result = await this.neo4jService.write(cypher, { id });
    return result[0]?.deleted > 0;
  }

  async linkToCategory(productId: string, categoryId: string) {
    const cypher = `
      MATCH (p:Produit {id: $productId})
      MATCH (c:Categorie {id: $categoryId})
      MERGE (p)-[:EST_DE_CATEGORIE]->(c)
      RETURN p, c
    `;

    await this.neo4jService.write(cypher, { productId, categoryId });
  }

  async findSimilar(productId: string, limit = 5) {
    const cypher = `
      MATCH (p:Produit {id: $productId})-[:EST_DE_CATEGORIE]->(c:Categorie)
      MATCH (similaire:Produit)-[:EST_DE_CATEGORIE]->(c)
      WHERE similaire.id <> $productId
        AND abs(similaire.prix - p.prix) < 50
      RETURN similaire
      ORDER BY abs(similaire.prix - p.prix)
      LIMIT $limit
    `;

    const result = await this.neo4jService.read(cypher, { productId, limit: neo4j.int(limit) });
    return result.map((r) => r.similaire.properties);
  }

  async findCompatible(productId: string) {
    const cypher = `
      MATCH (p:Produit {id: $productId})-[:COMPATIBLE_AVEC]->(compatible:Produit)
      RETURN compatible
    `;

    const result = await this.neo4jService.read(cypher, { productId });
    return result.map((r) => r.compatible.properties);
  }
}