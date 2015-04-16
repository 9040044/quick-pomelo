'use strict';

var P = require('bluebird');
var env = require('../env');
var logger = require('pomelo-logger').getLogger('test', __filename);

describe('player test', function(){
	beforeEach(env.dropDatabase);
	after(env.dropDatabase);

	it('create/remove/connect/disconnect', function(cb){
		var app = env.createApp('server1', 'area');

		return P.try(function(){
			return P.promisify(app.start, app)();
		})
		.then(function(){
			var playerController = app.controllers.player;
			var area = app.controllers.area;

			var autoconn = app.memdb.autoConnect();
			return autoconn.execute(function(){
				var playerId = null;
				return P.try(function(){
					return playerController.create({name : 'rain'});
				})
				.then(function(ret){
					playerId = ret;
					return playerController.connect(playerId, 'c1');
				})
				.then(function(){
					return playerController.push(playerId, 'notify', 'content', true);
				})
				.then(function(){
					return playerController.getMsgs(playerId, 0)
					.then(function(ret){
						ret.length.should.eql(1);
						ret[0].msg.should.eql('content');
					});
				})
				.then(function(){
					return playerController.disconnect(playerId);
				})
				.then(function(){
					return playerController.remove(playerId);
				});
			});
		})
		.then(function(){
			return P.promisify(app.stop, app)();
		})
		.nodeify(cb);
	});
});