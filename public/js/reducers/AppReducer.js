var AppConstants = require('../constants/AppConstants');

var AppReducer = function(state, action) {
    if (typeof state === 'undefined') {
        return  {counter: -1, userInfo: {user: -1, apps: {}, cas: {}},
                 username : null, isClosed: false, allUsers: [], deltaUnits: 1,
                 privileged: false, error: null, changeUnitsId: null};
    } else {
        switch(action.type) {
        case AppConstants.APP_UPDATE:
        case AppConstants.APP_NOTIFICATION:
            return Object.assign({}, state, action.state);
        case AppConstants.APP_ERROR:
            return Object.assign({}, state, {error: action.error});
        case AppConstants.WS_STATUS:
            return Object.assign({}, state, {isClosed: action.isClosed});
        default:
            return state;
        }
    };
};

module.exports = AppReducer;
