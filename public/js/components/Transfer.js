var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');
var TableTransfer = require('./TableTransfer');

class Transfer extends React.Component {
    constructor(props) {
        super(props);
        this.doDismiss = this.doDismiss.bind(this);
        this.handleTransferUsername = this.handleTransferUsername.bind(this);
        this.handleTransferUnits = this.handleTransferUnits.bind(this);
        this.doTransfer = this.doTransfer.bind(this);
    }

    doDismiss(ev) {
        AppActions.setLocalState(this.props.ctx, {
            transferMode: false
        });
    }

    handleTransferUsername(ev) {
        var username = ev.target.value;
        AppActions.setLocalState(this.props.ctx, {
            transferUsername: username
        });
    }

    handleTransferUnits(ev) {
        var units = ev.target.value;
        units = parseInt(units);
        AppActions.setLocalState(this.props.ctx, {
            transferUnits: (isNaN(units) ? '' : units)
        });
    }

    doTransfer(ev) {
        if (this.props.transferUsername &&
            (typeof this.props.transferUsername === 'string') &&
            this.props.transferUnits &&
            (typeof this.props.transferUnits === 'number')) {
            AppActions.transferUnits(this.props.ctx,
                                     this.props.transferUsername,
                                     this.props.transferUnits);
        } else {
            console.log('Error: cannot transfer units, missing inputs ' +
                        JSON.stringify(this.props));
            AppActions.setError(this.props.ctx,
                                new Error('Cannot transfer units, bad inputs'));
        }
    }

    render() {
        return cE(rB.Modal,{show: !!this.props.transferMode,
                            onHide: this.doDismiss,
                            animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-warning text-warning',
                      closeButton: true
                  }, cE(rB.Modal.Title, null, 'Transfer')),
                  cE(rB.Modal.Body, null,
                     cE(rB.Grid, {fluid: true},
                        cE(rB.Row, null,
                           cE(rB.Form, {horizontal: true},
                              cE(rB.FormGroup, {controlId: 'formTransfer'},
                                 cE(rB.Col, {sm:2, xs:4},
                                    cE(rB.ControlLabel, null, 'Username')
                                   ),
                                 cE(rB.Col, {sm:4, xs:8},
                                    cE(rB.FormControl, {
                                        type: 'text',
                                        value: this.props.transferUsername,
                                        placeholder: 'username',
                                        onChange: this.handleTransferUsername
                                    })),
                                 cE(rB.Col, {sm:2, xs:4},
                                    cE(rB.ControlLabel, null, 'Units')
                                   ),
                                 cE(rB.Col, {sm: 2, xs:8},
                                    cE(rB.FormControl, {
                                        type: 'text',
                                        value: this.props.transferUnits,
                                        placeholder: 'units',
                                        onChange: this.handleTransferUnits
                                    })),

                                 cE(rB.Col, {sm: 2, xs:4},
                                    cE(rB.Button, {
                                        onClick: this.doTransfer,
                                        bsStyle: 'primary'
                                    }, 'Transfer')
                                   )
                                )
                             )
                          ),
                        cE(rB.Row, null,
                           cE(TableTransfer, {
                               ctx: this.props.ctx,
                               transfers: this.props.transfers
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

module.exports = Transfer;
