var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');
var TableQuery = require('./TableQuery');

class Query extends React.Component {
    constructor(props) {
        super(props);
        this.doDismiss = this.doDismiss.bind(this);
        this.handleQueryUsername = this.handleQueryUsername.bind(this);
        this.doQuery = this.doQuery.bind(this);
        this.submit = this.submit.bind(this);
    }

    handleQueryUsername(ev) {
        var username = ev.target.value;
        AppActions.setLocalState(this.props.ctx, {
            queryUsername: username
        });
    }

    submit(ev) {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            this.doQuery(ev);
        }
    }

    doQuery(ev) {
        if (this.props.queryUsername &&
            (typeof this.props.queryUsername === 'string')) {

            AppActions.queryStats(this.props.ctx, this.props.queryUsername);
        } else {
            console.log('Error: cannot query username, missing inputs ' +
                        JSON.stringify(this.props));
            AppActions.setError(this.props.ctx,
                                new Error('Cannot query username, bad inputs'));
        }
    }

    doDismiss(ev) {
        AppActions.setLocalState(this.props.ctx, {
            queryMode: false
        });
    }

    render() {
        return cE(rB.Modal,{show: !!this.props.queryMode,
                            onHide: this.doDismiss,
                            animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-warning text-warning',
                      closeButton: true
                  }, cE(rB.Modal.Title, null, 'Query')),
                  cE(rB.Modal.Body, null,
                     cE(rB.Grid, {fluid: true},
                        cE(rB.Row, null,
                           cE(rB.Form, {horizontal: true},
                              cE(rB.FormGroup, {controlId: 'formUsername'},
                                 cE(rB.Col, {sm:2, xs:3},
                                    cE(rB.ControlLabel, null, 'Username')
                                   ),
                                 cE(rB.Col, {sm:4, xs:6},
                                    cE(rB.FormControl, {
                                        type: 'text',
                                        value: this.props.queryUsername,
                                        placeholder: 'username',
                                        onKeyPress: this.submit,
                                        onChange: this.handleQueryUsername
                                    })),
                                 cE(rB.Col, {sm:2, xs:3},
                                    cE(rB.Button, {
                                        onClick: this.doQuery,
                                        bsStyle: 'primary'
                                    }, 'Query')
                                   )
                                )
                             )
                          ),
                        cE(rB.Row, null,
                           cE(TableQuery, {
                               stats: this.props.stats,
                               myStats: this.props.myStats
                           })
                          )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doDismiss}, "Continue")
                    )
                 );
    }
};

module.exports = Query;
