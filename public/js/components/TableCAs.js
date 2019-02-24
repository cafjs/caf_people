var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

class TableCAs extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var self = this;
        var now = (new Date()).getTime()/(24*60*60*1000);
        var renderOneRow = function(i, caName, caInfo) {
            var diff = parseFloat(caInfo) - now;
            return  cE('tr', {key:10*i},
                       cE('td', {key:10*i+1}, caName),
                       (diff > 0 ? cE('td', {key:10*i+4}, diff.toFixed(2)) :
                        cE('td', {key:10*i+4,
                                  style: {background: "red", color: "white"}},
                           diff.toFixed(2)))
                      );
        };
        var renderRows = function() {
            var sorted = Object.keys(self.props.cas || {}).sort();
            return sorted.map(function(x, i) {
                return renderOneRow(i+1, x, self.props.cas[x]);
            });
        };
        return cE(rB.Table, {striped: true, responsive: true, bordered: true,
                             condensed: true, hover: true},
                  cE('thead', {key:0},
                     cE('tr', {key:1},
                        cE('th', {key:2}, 'Name'),
                        cE('th', {key:5}, 'Time Left (days)')
                       )
                    ),
                  cE('tbody', {key:8}, renderRows())
                 );
    }
};

module.exports = TableCAs;
