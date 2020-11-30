const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;

class TableCAs extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const self = this;
        const now = (new Date()).getTime()/(24*60*60*1000);
        const renderOneRow = function(i, caName, caInfo) {
            var diff = parseFloat(caInfo) - now;
            diff = diff.toFixed(2);
            return  cE('tr', {key:10*i},
                       cE('td', {key:10*i+1}, caName),
                       (diff >= 0 ? cE('td', {key:10*i+4}, `${diff}d`) :
                        cE('td', {key:10*i+4,
                                  style: {background: "red", color: "white"}},
                           `${diff}d`))
                      );
        };
        const renderRows = function() {
            const sorted = Object.keys(self.props.cas || {}).sort();
            return sorted.map(function(x, i) {
                return renderOneRow(i+1, x, self.props.cas[x]);
            });
        };
        return cE(rB.Table, {striped: true, responsive: true, bordered: true,
                             condensed: true, hover: true},
                  cE('thead', {key:0},
                     cE('tr', {key:1},
                        cE('th', {key:2}, 'Name'),
                        cE('th', {key:5}, 'Renew')
                       )
                    ),
                  cE('tbody', {key:8}, renderRows())
                 );
    }
};

module.exports = TableCAs;
