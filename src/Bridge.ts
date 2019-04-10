export interface IBridge {
  loadProducts(productIds: TProductId[]): Promise<any>;

  purchase(productId: TProductId, developerPayload: string): Promise<any>;

  subscribe(productId: TProductId, developerPayload: string): Promise<any>;

  upgrade(
    oldProductIds: TProductId[],
    productId: TProductId,
    developerPayload: string
  ): Promise<any>;

  loadOwnedPurchases(): Promise<any>;

  restore(): Promise<any>;
}
