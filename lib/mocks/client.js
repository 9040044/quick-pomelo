// Copyright 2015 MemDB.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied. See the License for the specific language governing
// permissions and limitations under the License. See the AUTHORS file
// for names of contributors.

'use strict';

var util = require('util');
var logger = require('memdb-client').logger.getLogger('test', __filename);
var P = require('memdb-client').Promise;
var pomeloClient = require('./pomelo-client');

var Client = function(opts){
    opts = opts || {};
    this.client = pomeloClient();
    this.opts = opts;
};

var proto = Client.prototype;

proto.connect = function(){
    var self = this;
    return new P(function(resolve, reject){
        self.client.init(self.opts, function(data){
            if(!!data){
                logger.info('connected to %s:%s', self.opts.host, self.opts.port);
                resolve(data);
            }
            else{
                reject(new Error('connect failed'));
            }
        });
    });
};

proto.disconnect = function(){
    this.client.disconnect();
    logger.info('disconnect from %s:%s', this.opts.host, this.opts.port);
};

proto.request = function(route, msg){
    msg = msg || {};
    var self = this;
    return new P(function(resolve, reject){
        logger.info('request %s %j', route, msg);
        self.client.request(route, msg, function(ret){
            if(ret.code === 500){
                logger.error('response %j', ret);
                reject(ret);
            }
            else{
                logger.info('response %j', ret);
                resolve(ret);
            }
        });
    });
};

proto.notify = function(route, msg){
    logger.info('notify %s %j', route, msg);
    this.client.notify(route, msg);
};

proto.on = function(route, fn){
    this.client.on(route, function(msg){
        logger.info('on %s: %j', route, msg);
        fn.apply(null, arguments);
    });
};

module.exports = function(opts){
    return new Client(opts);
};
