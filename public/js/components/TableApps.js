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
        var renderOneRow = function(i, appName, appInfo) {
            return  cE('tr', {key:10*i},
                       cE('td', {key:10*i+1}, appName),
                       cE('td', {key:10*i+4}, appInfo),
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
                         )
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
                        cE('th', {key:5}, 'Cost (days/unit)'),
                        cE('th', {key:7}, 'Stats')
                       )
                    ),
                  cE('tbody', {key:8}, renderRows())
                 );
    }
};

module.exports = TableApps;
