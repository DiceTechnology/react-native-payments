#import <Foundation/Foundation.h>
#import <StoreKit/StoreKit.h>

#import <React/RCTBridgeModule.h>

@interface RNPayments : NSObject <RCTBridgeModule, SKProductsRequestDelegate, SKPaymentTransactionObserver>

@end
