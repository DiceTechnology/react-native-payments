//
//  RNPromise.m
//  RNPayments
//
//  Created by Bahman Asadi on 05/04/2019.
//  Copyright © 2019 IMG Gaming. All rights reserved.
//

#import "RNPromise.h"

@implementation RNPromise

-(instancetype)initWithResolver:(RCTPromiseResolveBlock) resolve rejector:(RCTPromiseRejectBlock) reject {
    self = [super self];
    if (self) {
        self.resolve = resolve;
        self.reject = reject;
    }
    return self;
}

@end
