var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

class TableTransfer extends React.Component {
    constructor(props) {
        super(props);
        this.renderRows = this.renderRows.bind(this);
    }

    doRelease(id, ev) {
        AppActions.releaseTransfer(this.props.ctx, id);
    }

    renderRows() {
        var all = this.props.transfers;
        return Object.keys(all).map((key, i) => {
            var t = all[key];
            return cE('tr', {key:10*i},
                      cE('td', {key:10*i+6}, key.slice(-10)),
                      cE('td', {key:10*i+1}, t.to),
                      cE('td', {key:10*i+2}, t.units),
                      cE('td', {key:10*i+3}, (t.released ? 'true' : 'false')),
                      cE('td', {key:10*i+4},
                         (new Date(t.expires)).toLocaleString()),
                      cE('td', {key:10*i+5},
                         cE(rB.Button, {
                             onClick: this.doRelease.bind(this, key),
                             disabled: t.released,
                             bsStyle: 'danger'
                         }, 'Release')
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
                        cE('th', {key:7}, 'To'),
                        cE('th', {key:2}, 'Units'),
                        cE('th', {key:6}, 'Released'),
                        cE('th', {key:3}, 'Expires'),
                        cE('th', {key:5}, 'Release')
                       )
                    ),
                  cE('tbody', {key:8}, this.renderRows())
                 );
    }
};


module.exports = TableTransfer;
