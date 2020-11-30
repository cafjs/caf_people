var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

class TableApps extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var self = this;
        var now = (new Date()).getTime()/(24*60*60*1000);
        var renderOneRow = function(i, appName, appInfo) {
            const expires = appInfo.expires || now;
            const diff = parseFloat(expires) - now;
            const diffFix = diff.toFixed(2);

            return  cE('tr', {key:10*i},
                       cE('td', {key:10*i+1}, appName),
                       cE('td', {key:10*i+4}, appInfo.cost + 'd/u'),
                       cE('td', {key:10*i+7}, appInfo.plan),
                       cE('td', {key:10*i+8}, '' +
                          Math.trunc(appInfo.profit*100) + '%'),
                       cE('td', {key:10*i+5},
                          cE(rB.ButtonGroup, null,
                             cE(rB.Button, {
                                 onClick: (ev) => {
                                     AppActions.getAppInfo(self.props.ctx,
                                                           appName);
                                 },
                                 bsStyle: 'primary'
                             }, 'Resources'),
                             cE(rB.Button, {
                                 onClick: (ev) => {
                                     AppActions.getAppUsage(self.props.ctx,
                                                            appName);
                                 },
                                 bsStyle: 'info'
                             }, 'Users')
                            )
                         ),
                       (diff >= 0 ?
                        cE('td', {key:10*i+6}, `${diffFix}d`) :
                        cE('td', {key:10*i+6,
                                  style: {background: "red", color: "white"}},
                           `${diffFix}d`))
                      );
        };

        var renderRows = function() {
            var sorted = Object.keys(self.props.apps || {}).sort();
            return sorted.map(function(x, i) {
                return renderOneRow(i+1, x, self.props.apps[x]);
            });
        };

        return cE(rB.Table, {striped: true, responsive: true, bordered: true,
                             condensed: true, hover: true},
                  cE('thead', {key:0},
                     cE('tr', {key:1},
                        cE('th', {key:2}, 'Name'),
                        cE('th', {key:5}, 'Price'),
                        cE('th', {key: 32000}, 'Plan'),
                        cE('th', {key: 32001}, 'Profit'),
                        cE('th', {key:7}, 'Stats'),
                        cE('th', {key:8}, 'Renew')
                       )
                    ),
                  cE('tbody', {key:8}, renderRows())
                 );
    }
};

module.exports = TableApps;
