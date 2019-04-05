export interface IBridge {
  loadProducts(products: IProduct[]): Promise<any>;

  purchase(product: IProduct, developerPayload: string): Promise<any>;

  subscribe(product: IProduct, developerPayload: string): Promise<any>;

  upgrade(
    oldProducts: IProduct[],
    product: IProduct,
    developerPayload: string
  ): Promise<any>;

  loadOwnedPurchases(): Promise<any>;

  restore(): Promise<any>;
}
