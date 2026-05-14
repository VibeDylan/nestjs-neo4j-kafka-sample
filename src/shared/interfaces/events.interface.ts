export interface ProductCreatedEvent {
  type: 'PRODUCT_CREATED';
  timestamp: number;
  data: {
    id: string;
    nom: string;
    prix: number;
    stock: number;
  };
}

export interface ProductUpdatedEvent {
  type: 'PRODUCT_UPDATED';
  timestamp: number;
  data: {
    id: string;
    changes: Record<string, any>;
  };
}

export interface ProductDeletedEvent {
  type: 'PRODUCT_DELETED';
  timestamp: number;
  data: {
    id: string;
  };
}