'use strict';
var caf = require('caf_core');
var myUtils = caf.caf_components.myUtils;
var json_rpc = caf.caf_transport.json_rpc;

var app = require('../public/js/app.js');


var checkPrivileged = function(that) {
    if (!that.state.privileged) {
        throw new Error('Not enough privileges');
    }
};

exports.methods = {
    async __ca_init__() {
        this.$.security.addRule(this.$.security.newSimpleRule('registerCA'));
        this.$.security.addRule(this.$.security.newSimpleRule('registerApp'));
        this.$.security.addRule(this.$.security
                                .newSimpleRule('__external_ca_touch__'));

        this.state.counter = 0;
        this.state.userInfo = {user: -1, apps: {}, cas: {}};
        this.$.users.setHandleReplyMethod('handleReply');
        this.$.users.registerUser();
        this.$.session.limitQueue(1); // only the last notification
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.username = json_rpc.splitName(this.__ca_getName__())[0];
        this.state.privileged = (this.__ca_getName__() === 'root-admin');
        return [];
    },

    async __ca_pulse__() {
        try {
            this.state.counter  = this.state.counter + 1;
            self.$.react.render(app.main, [this.state]);
            if (this.state.counter % this.$.props.pulsesForReload === 0) {
                this.state.privileged && this.$.users.listUsersPrivileged();
                this.$.users.getUserInfo(this.state.username);
            }
            return [];
        } catch(err) {
            return [err];
        };
    },

    async handleReply(reqId, response) {
        var err, data;
        [err, data] = response;
        if (err) {
            this.state.error = {message: ' Request ID:' + reqId + ' message:' +
                                err.message || err};
            this.$.log && this.$.log.debug('Handle id:' + reqId + ' err:' +
                                           this.state.error.message);
            this.$.session.notify([this.state], 'default');
        } else {
            this.$.log && this.$.log.debug('Handle OK id:' + reqId +
                                           ' data:' + data);
            if (reqId.indexOf('getUserInfo_') === 0) {
                if (!myUtils.deepEqual(data, this.state.userInfo)) {
                    this.state.userInfo = data;
                    this.$.session.notify([this.state], 'default');
                }
            } else if (reqId.indexOf('listUsersPrivileged_') === 0) {
                if (!myUtils.deepEqual(data, this.scratch.allUsers)) {
                    this.scratch.allUsers = data;
                    this.$.session.notify([this.state], 'default');
                }
            } else if  (reqId.indexOf('changeUnitsPrivileged_') === 0) {
                this.state.changeUnitsId = reqId;
                this.$.session.notify([this.state], 'default');
            } else {
                this.$.users.getUserInfo(this.state.username);
            }
        }
        return [];
    },

    async changeUsername(username) {
        checkPrivileged(this);
        this.state.username = username;
        this.$.users.getUserInfo(this.state.username);
        return this.getState();
    },

    async hello(key) {
        this.$.react.setCacheKey(key);
        return this.getState();
    },

    async cleanError() {
        delete this.state.error;
        return this.getState();
    },

    async registerCA(tokenStr) {
        this.$.users.registerCA(tokenStr);
        return this.getState();
    },

    async registerApp(tokenStr) {
        this.$.users.registerApp(tokenStr);
        return this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, this.state];
    },

    async refreshUsers(prefix) {
        checkPrivileged(this);
        this.$.users.listUsersPrivileged();
        return this.getState();
    },

    async filterUsers(prefix) {
        checkPrivileged(this);
        var result = this.scratch.allUsers || [];
        result = (prefix ? result.filter((x) => (x.indexOf(prefix) === 0)) :
                  result);
        return [null, result];
    },

    async changeUnits(units) {
        checkPrivileged(this);
        var id = this.$.users.changeUnitsPrivileged(this.state.username, units);
        return [null, id];
    }
};

caf.init(module);
