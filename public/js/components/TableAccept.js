var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

class TableAccept extends React.Component {
    constructor(props) {
        super(props);
        this.renderRows = this.renderRows.bind(this);
    }

    doAccept(id, ev) {
        AppActions.acceptTransfer(this.props.ctx, id);
    }

    doDispute(id, ev) {
        AppActions.disputeTransfer(this.props.ctx, id);
    }

    renderRows() {
        var all = this.props.accepts;
        return Object.keys(all).map((key, i) => {
            var t = all[key];
            return cE('tr', {key:10*i},
                      cE('td', {key:10*i+6}, key.slice(-10)),
                      cE('td', {key:10*i+1}, t.from),
                      cE('td', {key:10*i+2}, t.units),
                      cE('td', {key:10*i+3}, (t.released ? 'true' : 'false')),
                      cE('td', {key:10*i+4},
                         (new Date(t.expires)).toLocaleString()),
                      cE('td', {key:10*i+5},
                         cE(rB.Button, {
                             onClick: this.doAccept.bind(this, key),
                             disabled: !t.released,
                             bsStyle: 'primary'
                         }, 'Accept')
                        ),
                      cE('td', {key:10*i+7},
                         cE(rB.Button, {
                             onClick: this.doDispute.bind(this, key),
                             bsStyle: 'danger',
                             disabled: t.released
                         }, 'Dispute')
                        )
                     );
        }
                                   );
    }

    render() {
        return cE(rB.Table, {striped: true, responsive: true, bordered: true,
                             condensed: true, hover: true},
                  cE('thead', {key:0},
                     cE('tr', {key:1},
                        cE('th', {key:4}, 'ID'),
                        cE('th', {key:7}, 'From'),
                        cE('th', {key:2}, 'Units'),
                        cE('th', {key:6}, 'Released'),
                        cE('th', {key:3}, 'Expires'),
                        cE('th', {key:5}, 'Accept'),
                        cE('th', {key:9}, 'Dispute')
                       )
                    ),
                  cE('tbody', {key:8}, this.renderRows())
                 );
    }
};


module.exports = TableAccept;
