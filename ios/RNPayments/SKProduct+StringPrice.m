//
//  SKProduct.m
//  RNPayments
//
//  Created by Bahman Asadi on 1/14/18.
//  Copyright © 2018 IMG Gaming. All rights reserved.
//

#import "SKProduct+StringPrice.h"

@implementation SKProduct (StringPrice)

- (NSString *)priceString {
    NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
    formatter.formatterBehavior = NSNumberFormatterBehavior10_4;
    formatter.numberStyle = NSNumberFormatterCurrencyStyle;
    formatter.locale = self.priceLocale;
    
    return [formatter stringFromNumber:self.price];
}

@end
