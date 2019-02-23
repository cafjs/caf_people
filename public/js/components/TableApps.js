var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

class TableApps extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var self = this;
        var renderOneRow = function(i, appName, appInfo) {
            return  cE('tr', {key:10*i},
                       cE('td', {key:10*i+1}, appName),
                       cE('td', {key:10*i+4}, appInfo)
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
                        cE('th', {key:5}, 'Cost (sec/unit)')
                       )
                    ),
                  cE('tbody', {key:8}, renderRows())
                 );
    }
};

module.exports = TableApps;
