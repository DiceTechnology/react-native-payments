#import "RNPayments.h"

#import <StoreKit/StoreKit.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>

#import "RNPromise.h"
#import "SKProduct+StringPrice.h"

NSString *const RNPaymentsTransactionState = @"RNPaymentsTransactionState";
NSString *const RNPaymentsTransactionStatePurchased = @"RNPaymentsTransactionStatePurchased";
NSString *const RNPaymentsTransaction = @"RNPaymentsTransaction";

@implementation RNPayments

{
    NSArray *products;
    NSMutableDictionary<NSString *, RNPromise *> *_promises;
}

- (instancetype)init
{
    if ((self = [super init])) {
        _promises = [[NSMutableDictionary alloc] init];
        [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
    }
    return self;
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

+(BOOL)requiresMainQueueSetup
{
    return YES;
}

RCT_EXPORT_MODULE()

- (NSArray<NSString *> *)supportedEvents
{
    return @[RNPaymentsTransaction];
}

- (void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions
{
    for (SKPaymentTransaction *transaction in transactions) {
        switch (transaction.transactionState) {
            case SKPaymentTransactionStateFailed: {
                NSString *key = RCTKeyForInstance(transaction.payment.productIdentifier);
                RNPromise *promise = _promises[key];
                if (promise) {
                    NSString *codeWithDomain = [NSString stringWithFormat:@"E%@%lld", transaction.error.domain.uppercaseString, (long long)transaction.error.code];
                    promise.reject(codeWithDomain, transaction.error.localizedDescription, transaction.error);
                    [_promises removeObjectForKey:key];
                } else {
                    RCTLogWarn(@"No callback registered for transaction with state failed.");
                }
                [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
                break;
            }
            case SKPaymentTransactionStatePurchased: {
                NSString *key = RCTKeyForInstance(transaction.payment.productIdentifier);
                RNPromise *promise = _promises[key];
                if (promise) {
                    NSDictionary *purchase = [self getPurchaseData:transaction];
                    promise.resolve(purchase);
                    [_promises removeObjectForKey:key];
                } else {
                    RCTLogWarn(@"No callback registered for transaction with state purchased.");
                    NSDictionary *purchase = [self getPurchaseData:transaction];
                    NSDictionary *body =@{
                                          RNPaymentsTransactionState: RNPaymentsTransactionStatePurchased,
                                          @"purchase": purchase
                                          };
                    [self sendEventWithName:RNPaymentsTransaction body: body];
                }
                [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
                break;
            }
            case SKPaymentTransactionStateRestored:
                [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
                break;
            case SKPaymentTransactionStatePurchasing:
                NSLog(@"purchasing");
                break;
            case SKPaymentTransactionStateDeferred:
                NSLog(@"deferred");
                break;
            default:
                break;
        }
    }
}

RCT_EXPORT_METHOD(purchaseProductForUser:(NSString *)productIdentifier
                  username:(NSString *)username
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject)
{
    [self doPurchaseProduct:productIdentifier username:username resolver: resolve rejector: reject];
}

RCT_EXPORT_METHOD(purchaseProduct:(NSString *)productIdentifier
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject)
{
    [self doPurchaseProduct:productIdentifier username:nil resolver: resolve rejector: reject];
}

- (void) doPurchaseProduct:(NSString *)productIdentifier
                  username:(NSString *)username
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject
{
    SKProduct *product;
    for(SKProduct *p in products)
    {
        if([productIdentifier isEqualToString:p.productIdentifier]) {
            product = p;
            break;
        }
    }
    
    if(product) {
        SKMutablePayment *payment = [SKMutablePayment paymentWithProduct:product];
        if(username) {
            payment.applicationUsername = username;
        }
        [[SKPaymentQueue defaultQueue] addPayment:payment];
        _promises[RCTKeyForInstance(payment.productIdentifier)] = [[RNPromise alloc] initWithResolver: resolve rejector: reject];
    } else {
        reject(@"invalid_product", @"invalid product", nil);
    }
}

- (void)paymentQueue:(SKPaymentQueue *)queue
restoreCompletedTransactionsFailedWithError:(NSError *)error
{
    NSString *key = RCTKeyForInstance(@"restoreRequest");
    RNPromise *promise = _promises[key];
    if (promise) {
        switch (error.code)
        {
            case SKErrorPaymentCancelled:
                promise.reject(@"user_cancelled", @"user cancelled", nil);
                break;
            default:
                promise.reject(@"restore_failed", @"restore failed", nil);
                break;
        }
        
        [_promises removeObjectForKey:key];
    } else {
        RCTLogWarn(@"No callback registered for restore product request.");
    }
}

- (void)paymentQueueRestoreCompletedTransactionsFinished:(SKPaymentQueue *)queue
{
    NSString *key = RCTKeyForInstance(@"restoreRequest");
    RNPromise *promise = _promises[key];
    if (promise) {
        NSMutableArray *productsArrayForJS = [NSMutableArray array];
        for(SKPaymentTransaction *transaction in queue.transactions){
            if(transaction.transactionState == SKPaymentTransactionStateRestored) {
                
                NSDictionary *purchase = [self getPurchaseData:transaction];
                
                [productsArrayForJS addObject:purchase];
                [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
            }
        }
        promise.resolve(productsArrayForJS);
        [_promises removeObjectForKey:key];
    } else {
        RCTLogWarn(@"No callback registered for restore product request.");
    }
}

RCT_EXPORT_METHOD(restorePurchasesWithResolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject)
{
    NSString *restoreRequest = @"restoreRequest";
    _promises[RCTKeyForInstance(restoreRequest)] = [[RNPromise alloc] initWithResolver: resolve rejector: reject];
    [[SKPaymentQueue defaultQueue] restoreCompletedTransactions];
}

RCT_EXPORT_METHOD(restorePurchasesForUser:(NSString *)username
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject)
{
    NSString *restoreRequest = @"restoreRequest";
    _promises[RCTKeyForInstance(restoreRequest)] = [[RNPromise alloc] initWithResolver: resolve rejector: reject];
    if(!username) {
        reject(@"username_required", @"username required", nil);
        return;
    }
    [[SKPaymentQueue defaultQueue] restoreCompletedTransactionsWithApplicationUsername:username];
}

RCT_EXPORT_METHOD(loadProducts:(NSArray *)productIdentifiers
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject)
{
    SKProductsRequest *productsRequest = [[SKProductsRequest alloc]
                                          initWithProductIdentifiers:[NSSet setWithArray:productIdentifiers]];
    productsRequest.delegate = self;
    _promises[RCTKeyForInstance(productsRequest)] = [[RNPromise alloc] initWithResolver: resolve rejector: reject];
    [productsRequest start];
}

RCT_EXPORT_METHOD(canMakePayments:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject)
{
    BOOL canMakePayments = [SKPaymentQueue canMakePayments];
    resolve(@(canMakePayments));
}

RCT_EXPORT_METHOD(receiptData:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject)
{
    NSURL *receiptUrl = [[NSBundle mainBundle] appStoreReceiptURL];
    NSData *receiptData = [NSData dataWithContentsOfURL:receiptUrl];
    if (!receiptData) {
        reject(@"not_available", @"not available", nil);
    } else {
        resolve([receiptData base64EncodedStringWithOptions:0]);
    }
}

// SKProductsRequestDelegate protocol method
- (void)productsRequest:(SKProductsRequest *)request
     didReceiveResponse:(SKProductsResponse *)response
{
    NSString *key = RCTKeyForInstance(request);
    RNPromise *promise = _promises[key];
    if (promise) {
        products = [NSMutableArray arrayWithArray:response.products];
        NSMutableArray *productsArrayForJS = [NSMutableArray array];
        for(SKProduct *item in response.products) {
            NSDictionary *product = @{
                                      @"identifier": item.productIdentifier,
                                      @"price": item.price,
                                      @"currencySymbol": [item.priceLocale objectForKey:NSLocaleCurrencySymbol],
                                      @"currencyCode": [item.priceLocale objectForKey:NSLocaleCurrencyCode],
                                      @"priceString": item.priceString,
                                      @"countryCode": [item.priceLocale objectForKey: NSLocaleCountryCode],
                                      @"downloadable": item.downloadable ? @"true" : @"false" ,
                                      @"description": item.localizedDescription ? item.localizedDescription : @"",
                                      @"title": item.localizedTitle ? item.localizedTitle : @"",
                                      };
            [productsArrayForJS addObject:product];
        }
        promise.resolve(productsArrayForJS);
        [_promises removeObjectForKey:key];
    } else {
        RCTLogWarn(@"No callback registered for load product request.");
    }
}

// SKProductsRequestDelegate network error
- (void)request:(SKRequest *)request didFailWithError:(NSError *)error{
    NSString *key = RCTKeyForInstance(request);
    RNPromise *promise = _promises[key];
    if(promise) {
        NSString *codeWithDomain = [NSString stringWithFormat:@"E%@%lld", error.domain.uppercaseString, (long long)error.code];
        promise.reject(codeWithDomain, error.localizedDescription, error);
        [_promises removeObjectForKey:key];
    }
}

- (NSDictionary *)getPurchaseData:(SKPaymentTransaction *)transaction {
    NSMutableDictionary *purchase = [NSMutableDictionary dictionaryWithDictionary: @{
                                                                                     @"transactionDate": @(transaction.transactionDate.timeIntervalSince1970 * 1000),
                                                                                     @"transactionIdentifier": transaction.transactionIdentifier,
                                                                                     @"productIdentifier": transaction.payment.productIdentifier,
                                                                                     @"transactionReceipt": [[transaction transactionReceipt] base64EncodedStringWithOptions:0]
                                                                                     }];
    // originalTransaction is available for restore purchase and purchase of cancelled/expired subscriptions
    SKPaymentTransaction *originalTransaction = transaction.originalTransaction;
    if (originalTransaction) {
        purchase[@"originalTransactionDate"] = @(originalTransaction.transactionDate.timeIntervalSince1970 * 1000);
        purchase[@"originalTransactionIdentifier"] = originalTransaction.transactionIdentifier;
    }
    
    NSURL *receiptUrl = [[NSBundle mainBundle] appStoreReceiptURL];
    NSData *receiptData = [NSData dataWithContentsOfURL:receiptUrl];
    if (receiptData) {
        purchase[@"appReceipt"] = [receiptData base64EncodedStringWithOptions:0];
    }
    
    return purchase;
}

- (void)dealloc
{
    [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
}

#pragma mark Private

static NSString *RCTKeyForInstance(id instance)
{
    return [NSString stringWithFormat:@"%p", instance];
}

@end
