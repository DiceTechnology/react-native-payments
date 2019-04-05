//
//  RNPromise.h
//  RNPayments
//
//  Created by Bahman Asadi on 05/04/2019.
//  Copyright © 2019 IMG Gaming. All rights reserved.
//

#import <Foundation/Foundation.h>

#import <React/RCTBridgeModule.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNPromise : NSObject

@property RCTPromiseResolveBlock resolve;
@property RCTPromiseRejectBlock reject;

-(instancetype)initWithResolver:(RCTPromiseResolveBlock) resolve rejector:(RCTPromiseRejectBlock) reject;

@end

NS_ASSUME_NONNULL_END
