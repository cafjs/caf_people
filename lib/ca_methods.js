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

var allState = function(that) {
    return (that.state.privileged ?
            Object.assign({}, that.state, that.scratch) : that.state);
};

var expireOffers = function(that) {
    var all = that.state.userInfo.offers || {};
    var now = (new Date()).getTime();
    Object.keys(all).forEach(x => {
        var t = all[x];
        if (t.expires < now) {
            that.$.log && that.$.log.debug('Expiring ' + x);
            that.$.users.expireTransfer(t.to, t.units, x);
        }
    });
};

exports.methods = {
    async __ca_init__() {
        this.$.security.addRule(this.$.security.newSimpleRule('registerCA'));
        this.$.security.addRule(this.$.security.newSimpleRule('checkCA'));
        this.$.security.addRule(this.$.security.newSimpleRule('checkApp'));
        this.$.security.addRule(this.$.security
                                .newSimpleRule('__external_ca_touch__'));

        this.state.counter = 0;
        this.state.userInfo = {user: -1, apps: {}, cas: {}, offers: {},
                               accepts: {}, reputation: {}};
        this.$.users.setHandleReplyMethod('handleReply');
        this.$.users.registerUser();
        this.$.session.limitQueue(1); // only the last notification
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        var split = json_rpc.splitName(this.__ca_getName__());
        this.state.username = split[0];
        this.state.privileged = (this.__ca_getName__() === 'root-admin');
        if (this.$.props.validCANames.some(x => (x === split[1]))) {
            return [];
        } else {
            return [new Error('Invalid CA name')];
        }
    },

    async __ca_pulse__() {
        try {
            this.state.counter  = this.state.counter + 1;
            this.$.react.render(app.main, [allState(this)]);
            if (this.state.counter % this.$.props.pulsesForReload === 0) {
                this.state.privileged && this.$.users.listUsersPrivileged();
                this.$.users.getUserInfo(this.state.username);
                expireOffers(this);
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
            err = (err.err ? err.err : err); // LUA wrapped error
            this.state.error = {message: '' + (err.message || err) +
                                ' (Request ID:' + reqId.slice(-10) + ')'};
            this.$.log && this.$.log.debug('Handle id:' + reqId + ' err:' +
                                           this.state.error.message);
            this.$.session.notify([allState(this)], 'default');
        } else {
            this.$.log && this.$.log.debug('Handle OK id:' + reqId +
                                           ' data:' + data);
            if (reqId.indexOf('getUserInfo_') === 0) {
                if (!myUtils.deepEqual(data, this.state.userInfo)) {
                    this.state.userInfo = data;
                    this.$.session.notify([allState(this)], 'default');
                }
            } else if (reqId.indexOf('listUsersPrivileged_') === 0) {
                if (!myUtils.deepEqual(data, this.scratch.allUsers)) {
                    this.scratch.allUsers = data;
                    this.$.session.notify([allState(this)], 'default');
                }
            } else if (reqId.indexOf('changeUnitsPrivileged_') === 0) {
                this.state.changeUnitsId = reqId;
                this.$.session.notify([allState(this)], 'default');
            } else {
                this.$.users.getUserInfo(this.state.username);
            }
        }
        return [];
    },

    async transferUnits(username, units) {
        var reqId = this.$.users.transferUnits(username, units);
        return [null, {transferId: reqId}];
    },

    async releaseTransfer(id) {
        var t = this.state.userInfo.offers[id];
        if (t) {
            var reqId = this.$.users.releaseTransfer(id);
            return [null, {releaseId: reqId}];
        } else {
            var err = new Error('releaseTransfer:Unknown transfer ' + id);
            return [err];
        }
    },

    async acceptTransfer(id) {
        var t = this.state.userInfo.accepts[id];
        if (t) {
            var reqId = this.$.users.acceptTransfer(t.from, t.units, id);
            return [null, {acceptId: reqId}];
        } else {
            var err = new Error('acceptTransfer:Unknown transfer ' + id);
            return [err];
        }
    },

    async disputeTransfer(id) {
        var t = this.state.userInfo.accepts[id];
        if (t) {
            var reqId = this.$.users.disputeTransfer(t.from, t.units, id);
            return [null, {disputeId: reqId}];
        } else {
            var err = new Error('disputeTransfer:Unknown transfer ' + id);
            return [err];
        }
    },

    async queryStats(username) {
        try {
            var r = await this.$.users.dirtyDescribeReputation(username);
            r.username = username;
            return [null, {stats: r}];
        } catch (err) {
            return [err];
        }
    },

    async changeUsername(username) {
        checkPrivileged(this);
        if (username !== this.state.username) {
            this.state.username = username;
            this.state.userInfo = {user: -1, apps: {}, cas: {}};
        }
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

    async checkApp(app) {
        try {
            var res = await this.$.users.dirtyCheckApp(app);
            if (res) {
                return [null, res];
            } else {
                return [new Error('App not registered')];
            }
        } catch (err) {
            return [err];
        }
    },

    async checkCA(ca) {
        try {
            var res = await this.$.users.dirtyCheckCA(ca);
            if (res < 0) {
                return [new Error('CA has expired')];
            } else {
                return [null, res];
            }
        } catch (err) {
            return [err];
        }
    },

    async registerCA(tokenStr) {
        try {
            var res = await this.$.users.dirtyRegisterCA(tokenStr);
            return [null, res];
        } catch (err) {
            return [err];
        }
    },

    async registerApp(tokenStr) {
        this.$.users.registerApp(tokenStr);
        return this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, allState(this)];
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
        return [null, {pendingId: id}];
    }
};

caf.init(module);
