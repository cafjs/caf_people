'use strict';

const APP_SESSION = 'default';

exports.checkPrivileged = function(self) {
    if (!self.state.privileged) {
        throw new Error('Not enough privileges');
    }
};

const allState = exports.allState = function(self) {
    return (self.state.privileged ?
            Object.assign({}, self.state, self.scratch) : self.state);
};

exports.expireOffers = function(self) {
    const all = self.state.userInfo.offers || {};
    const now = (new Date()).getTime();
    Object.keys(all).forEach(x => {
        const t = all[x];
        if (t.expires < now) {
            self.$.log && self.$.log.debug('Expiring ' + x);
            self.$.users.expireTransfer(t.to, t.units, x);
        }
    });
};

exports.notifyApp = function(self) {
    self.$.session.notify([allState(self)], APP_SESSION);
};

exports.retryCapture = async function(self) {
    const pendingIds = Object.keys(self.state.pendingOrders);
    for (let i = 0; i < pendingIds.length; i++) {
        const x = pendingIds[i];
        const [err] = await self.captureOrder(x);
        const msg = err ?
              'Capture retry failed for order ' :
              'Capture retry OK for order ';
        self.$.log && self.$.log.debug(msg + x);
    }
};

exports.validateTurtlesToken = function(self, tokenStr) {
    const throwError = function(msg) {
        const err = new Error(msg);
        err['tokenStr'] = tokenStr.slice(0, 10);
        throw err;
    };

    if (!self.$.security) {
        throwError('Security disabled: cannot validate token');
    }

    const token = self.$.security.verifyToken(tokenStr);

    if (!token) {
        throwError('Invalid token');
    } else {
        if ((token.appPublisher !== 'root') ||
            (token.appLocalName !== 'turtles')) {
            throwError('Invalid app in token');
        }
        if (token.caOwner !== self.state.username) {
            throwError('Invalid user in token');
        }
    }
};
