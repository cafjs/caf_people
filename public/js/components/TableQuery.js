var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

class TableQuery extends React.Component {
    constructor(props) {
        super(props);
        this.renderRows = this.renderRows.bind(this);
    }

    renderRows() {
        var all = [];
        this.props.myStats && all.push(this.props.myStats);
        this.props.stats && (Object.keys(this.props.stats).length > 0) &&
            all.push(this.props.stats);
        return all.map((stat, i) => cE('tr', {key:10*i},
                                       cE('td', {key:10*i+6}, stat.username ||
                                          'me'),
                                       cE('td', {key:10*i+1}, stat.joined),
                                       cE('td', {key:10*i+2}, stat.completed),
                                       cE('td', {key:10*i+4}, stat.disputed),
                                       cE('td', {key:10*i+5}, stat.expired)
                                      )
                      );
    }

    render() {
        return cE(rB.Table, {striped: true, responsive: true, bordered: true,
                             condensed: true, hover: true},
                  cE('thead', {key:0},
                     cE('tr', {key:1},
                        cE('th', {key:7}, 'Name'),
                        cE('th', {key:2}, 'Joined'),
                        cE('th', {key:3}, 'Completed'),
                        cE('th', {key:5}, 'Disputed'),
                        cE('th', {key:6}, 'Expired')
                       )
                    ),
                  cE('tbody', {key:8}, this.renderRows())
                 );
    }
};


module.exports = TableQuery;
