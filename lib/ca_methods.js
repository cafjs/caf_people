'use strict';
const assert = require('assert');
const caf = require('caf_core');
const myUtils = caf.caf_components.myUtils;
const json_rpc = caf.caf_transport.json_rpc;

const app = require('../public/js/app.js');
const DOLLARS_PER_UNIT = 0.1;
const APP_SESSION = 'default';

const checkPrivileged = function(that) {
    if (!that.state.privileged) {
        throw new Error('Not enough privileges');
    }
};

const allState = function(that) {
    return (that.state.privileged ?
            Object.assign({}, that.state, that.scratch) : that.state);
};

const expireOffers = function(that) {
    const all = that.state.userInfo.offers || {};
    const now = (new Date()).getTime();
    Object.keys(all).forEach(x => {
        const t = all[x];
        if (t.expires < now) {
            that.$.log && that.$.log.debug('Expiring ' + x);
            that.$.users.expireTransfer(t.to, t.units, x);
        }
    });
};

const notifyApp = function(self) {
    self.$.session.notify([allState(self)], APP_SESSION);
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
        this.state.orders = {};
        this.state.pendingOrders = {};
        this.scratch.tokenStr = null;
        this.$.users.setHandleReplyMethod('handleReply');
        this.$.users.registerUser();
        this.$.session.limitQueue(1); // only the last notification
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.clientId = this.$.paypal.getClientId();
        const split = json_rpc.splitName(this.__ca_getName__());
        this.state.username = split[0];
        this.state.privileged = (this.__ca_getName__() === 'root-admin');
        if (this.$.props.validCANames.some(x => (x === split[1]))) {
            return [];
        } else {
            return [new Error('Invalid CA name')];
        }
    },

    async __ca_resume__(cp) {
        // always reload in case it changed
        this.state.clientId = this.$.paypal.getClientId();

        // repeat initialization for backward compatibility
        this.state.orders = this.state.orders || {};
        this.state.pendingOrders = this.state.pendingOrders || {};
        return [];
    },

    async __ca_pulse__() {
        try {
            this.state.counter  = this.state.counter + 1;
            this.$.react.render(app.main, [allState(this)]);
            if (this.state.counter %
                this.$.props.pulsesForUserInfoReload === 0) {
                this.state.privileged && this.$.users.listUsersPrivileged();
                this.$.users.getUserInfo(this.state.username);
                expireOffers(this);
            }
            if (this.state.privileged) {
                this.state.lastCompute = this.state.lastCompute || 0;
                const now = (new Date()).getTime();
                const deltaSec = (now - this.state.lastCompute)/1000;
                if (deltaSec > this.$.props.computeAppUsageIntervalInSec) {
                    this.$.users.computeAppUsagePrivileged();
                    this.state.lastCompute = now;
                }
            }

            //GC expired orders
            const toDelete = [];
            const expiredTime = (new Date()).getTime() -
                  1000 * this.$.props.orderExpireTimeInSec;

            Object.keys(this.state.pendingOrders).forEach((x) => {
                if (this.state.pendingOrders[x].created < expiredTime) {
                    toDelete.push(x);
                }
            });

            if (toDelete.length > 0) {
                this.$.log && this.$.log.debug('Deleting orders: ' +
                                               JSON.stringify(toDelete));
                toDelete.forEach(x => delete this.state.pendingOrders[x]);
                notifyApp(this); // reload state
            }

            // Retry capture of pending orders
            if (this.scratch.tokenStr &&
                (this.state.counter % this.$.props.pulsesForCaptureRetry === 0)
               ) {
                const pendingIds = Object.keys(this.state.pendingOrders);
                for (let i = 0; i < pendingIds.length; i++) {
                    const x = pendingIds[i];
                    const [err, order] = await this.captureOrder(x);
                    const msg = err ?
                        'Capture retry failed for order ' :
                        'Capture retry OK for order ';
                    this.$.log && this.$.log.debug(msg + x);
                }
            }

            return [];
        } catch(err) {
            return [err];
        };
    },

    async handleReply(reqId, response) {
        let [err, data] = response;
        if (err) {
            err = (err.err ? err.err : err); // LUA wrapped error
            this.state.error = {message: '' + (err.message || err) +
                                ' (Request ID:' + reqId.slice(-10) + ')'};
            this.$.log && this.$.log.debug('Handle id:' + reqId + ' err:' +
                                           this.state.error.message);
            notifyApp(this);
        } else {
            this.$.log && this.$.log.debug('Handle OK id:' + reqId +
                                           ' data:' + data);
            if (reqId.indexOf('getUserInfo_') === 0) {
                if (!myUtils.deepEqual(data, this.state.userInfo)) {
                    this.state.userInfo = data;
                    notifyApp(this);
                }
            } else if (reqId.indexOf('listUsersPrivileged_') === 0) {
                if (!myUtils.deepEqual(data, this.scratch.allUsers)) {
                    this.scratch.allUsers = data;
                    notifyApp(this);
                }
            } else if (reqId.indexOf('changeUnitsPrivileged_') === 0) {
                this.state.changeUnitsId = reqId;
                notifyApp(this);
            } else {
                this.$.users.getUserInfo(this.state.username);
            }
        }
        return [];
    },

    async transferUnits(username, units) {
        const reqId = this.$.users.transferUnits(username, units);
        return [null, {transferId: reqId}];
    },

    async releaseTransfer(id) {
        const t = this.state.userInfo.offers[id];
        if (t) {
            const reqId = this.$.users.releaseTransfer(id);
            return [null, {releaseId: reqId}];
        } else {
            const err = new Error('releaseTransfer:Unknown transfer ' + id);
            return [err];
        }
    },

    async acceptTransfer(id) {
        const t = this.state.userInfo.accepts[id];
        if (t) {
            const reqId = this.$.users.acceptTransfer(t.from, t.units, id);
            return [null, {acceptId: reqId}];
        } else {
            const err = new Error('acceptTransfer:Unknown transfer ' + id);
            return [err];
        }
    },

    async disputeTransfer(id) {
        const t = this.state.userInfo.accepts[id];
        if (t) {
            const reqId = this.$.users.disputeTransfer(t.from, t.units, id);
            return [null, {disputeId: reqId}];
        } else {
            const err = new Error('disputeTransfer:Unknown transfer ' + id);
            return [err];
        }
    },

    async queryStats(username) {
        try {
            const r = await this.$.users.dirtyDescribeReputation(username);
            r.username = username;
            return [null, {stats: r}];
        } catch (err) {
            return [err];
        }
    },

    async hello(key, tokenStr) {
        this.$.react.setCacheKey(key);
        if (tokenStr) {
            this.scratch.tokenStr = tokenStr;
        }
        if (this.state.privileged) {
            const [err, value] = await this.getBankBalance();
            this.state.bankBalance = value.bankBalance;
        }
        return this.getState();
    },

    async cleanError() {
        delete this.state.error;
        return this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, allState(this)];
    },

    async getAppInfo(app) {
        return [null, {appInfo: this.$.appInfo.getAppInfo(app)}];
    },

    async registerApp(appTokenStr) {
        this.$.users.registerApp(appTokenStr);
        return this.getState();
    },

    async getAppUsage(appName) {
        // Throws if not privileged and `appName` has a different owner
        return [null, {appUsage: this.$.users.getAppUsage(appName)}];
    },

    // returns {cost: {appName:string, value: number}}
    async getAppCost(appName) {
        try {
            const res = await this.$.users.dirtyGetAppCost(appName);
             if (res) {
                 return [null, {cost: {appName: appName, value: res}}];
            } else {
                return [new Error('Application not registered')];
            }
        } catch (err) {
            return [err];
        }
    },

    async getPrice(units) {
        return [null, {price: this.$.paypal.getPrice(units)}];
    },

    async createOrder(units) {
        try {
            const [, res] = await this.getPrice(units);
            const value = res.price;
            const response = await this.$.paypal.dirtyCreateOrder(units);
            this.$.log && this.$.log.debug('Order response:' +
                                           JSON.stringify(response));
            const {id} = response;
            const created = (new Date()).getTime();
            const user = this.state.username;
            const order = {created, id, user, units, value};
            this.state.pendingOrders[id] = order;
            notifyApp(this); // reload state
            return [null, order];
        } catch (err) {
            return [err];
        }
    },

    async captureOrder(id) {
        try {
            if (this.state.orders[id]) {
                // idempotent
                notifyApp(this); // reload state
                return [null, this.state.orders[id]];
            } else if (this.state.pendingOrders[id]) {
                assert(this.scratch.tokenStr, 'Missing token');
                const order = await this.$.paypal.dirtyCaptureOrder(id);
                const pendingOrder = this.state.pendingOrders[id];
                assert(order.units === pendingOrder.units);
                assert(order.user === pendingOrder.user);
                assert(this.state.username === pendingOrder.user);

                // Payment ID only available after capture
                pendingOrder.tid = order.tid;

                this.$.users.changeUnits(this.state.username, order.units);
                this.$.users.confirmOrder(this.scratch.tokenStr, pendingOrder);
                this.$.bank.changeBalance(order.units*DOLLARS_PER_UNIT,
                                          JSON.stringify(order));

                this.state.orders[id] = pendingOrder;
                delete this.state.pendingOrders[id];
                notifyApp(this); // reload state
                return [null, pendingOrder];
            } else {
                return [new Error(`Unknown order ${id}`)];
            }
        } catch (err) {
            this.$.log && this.$.log.debug('CaptureOrder: Got error ' +
                                           myUtils.errToPrettyStr(err));
            return [err];
        }
    },

    // Public methods called by anybody

    async checkApp(app) {
        try {
            const res = await this.$.users.dirtyCheckApp(app);
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
            const res = await this.$.users.dirtyCheckCA(ca);
            if (res < 0) {
                return [new Error('CA has expired')];
            } else {
                return [null, res];
            }
        } catch (err) {
            return [err];
        }
    },

    async registerCA(caTokenStr) {
        try {
            const res = await this.$.users.dirtyRegisterCA(caTokenStr);
            return [null, res];
        } catch (err) {
            return [err];
        }
    },

    // Privileged methods

    async getBankBalance() {
        checkPrivileged(this);
        const bankBalance = await this.$.bank.dirtyGetBalance();
        return [null, {bankBalance}];
    },

    async computeAppUsage() {
        checkPrivileged(this);
        this.$.users.computeAppUsagePrivileged();
        return [];
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

    async refreshUsers(prefix) {
        checkPrivileged(this);
        this.$.users.listUsersPrivileged();
        return this.getState();
    },

    async filterUsers(prefix) {
        checkPrivileged(this);
        const result = this.scratch.allUsers || [];
        result = (prefix ? result.filter((x) => (x.indexOf(prefix) === 0)) :
                  result);
        return [null, result];
    },

    async changeUnits(units) {
        checkPrivileged(this);
        const id = this.$.users.changeUnits(this.state.username, units);
        return [null, {pendingId: id}];
    },

    async updateApp(appName, timePerUnit) {
        checkPrivileged(this);
        const id = this.$.users.updateAppPrivileged(appName, timePerUnit);
        return [null, {pendingId: id}];
    }
};

caf.init(module);
