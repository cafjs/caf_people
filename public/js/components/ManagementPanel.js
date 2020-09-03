const React = require('react');
const rB = require('react-bootstrap');
const Select = require('react-select').default;
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class ManagementPanel extends React.Component {
    constructor(props) {
        super(props);

        this.handleDeltaUnits = this.handleDeltaUnits.bind(this);
        this.doChangeUnits = this.doChangeUnits.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.doTransfer = this.doTransfer.bind(this);
        this.doAccept = this.doAccept.bind(this);
        this.doQuery = this.doQuery.bind(this);

        this.handleAppNameCost = this.handleAppNameCost.bind(this);
        this.handleCost = this.handleCost.bind(this);
        this.doChangeCost = this.doChangeCost.bind(this);
        this.doUpdateUsage = this.doUpdateUsage.bind(this);
    }

    handleAppNameCost(ev) {
        AppActions.setLocalState(this.props.ctx, {
            appNameCost: ev.target.value
        });
    }

    handleCost(ev) {
        let cost = parseFloat(ev.target.value);
        cost = (isNaN(cost) ? ev.target.value : cost);
        AppActions.setLocalState(this.props.ctx, {cost});
    }

    doChangeCost(ev) {
        if (this.props.appNameCost &&
            (typeof this.props.appNameCost === 'string') &&
            (typeof this.props.cost === 'number')) {
            AppActions.updateApp(this.props.ctx, this.props.appNameCost,
                                 this.props.cost);
        } else {
            console.log('Error: Cannot change cost, missing inputs ' +
                        JSON.stringify(this.props));
            AppActions.setError(this.props.ctx,
                                new Error('Cannot change cost, bad inputs'));
        }
    }

    doUpdateUsage(ev) {
        AppActions.computeAppUsage(this.props.ctx);
    }

    handleDeltaUnits(ev) {
        let deltaUnits = parseFloat(ev.target.value);
        deltaUnits = (isNaN(deltaUnits) ? ev.target.value : deltaUnits);
        AppActions.setLocalState(this.props.ctx, {
            deltaUnits: deltaUnits
        });
    }

    doTransfer(ev) {
        AppActions.setLocalState(this.props.ctx, {
            transferMode: true
        });
    }

    doAccept(ev) {
        AppActions.setLocalState(this.props.ctx, {
            acceptMode: true
        });
    }

    doQuery(ev) {
        AppActions.setLocalState(this.props.ctx, {
            queryMode: true
        });
    }

    doChangeUnits(ev) {
        if (this.props.username && (typeof this.props.username === 'string') &&
            (typeof this.props.deltaUnits === 'number')) {
            AppActions.changeUnits(this.props.ctx, this.props.deltaUnits);
        } else {
            console.log('Error: cannot change units, missing inputs ' +
                        JSON.stringify(this.props));
            AppActions.setError(this.props.ctx,
                                new Error('Cannot change units, bad inputs'));
        }
    }

    handleSelectChange(user) {
        const username = user.value;
        if (username && (typeof username === 'string')) {
            AppActions.changeUsername(this.props.ctx, username);
        } else {
            console.log('Error: cannot change user, missing inputs ' +
                        JSON.stringify(username));
            AppActions.setError(this.props.ctx,
                                new Error('Cannot change user, bad inputs'));
        }
    }

    render() {
        const fields = (this.props.privileged ? [
            cE(rB.Col, { xs: 12, sm: 8, key: 2355},
               cE(rB.FormGroup, {
                   controlId: 'deltaUnitsId'
               },
                  cE(rB.ControlLabel, null, 'Change Units'),
                  cE(rB.FormControl, {
                      type: 'text',
                      value: this.props.deltaUnits,
                      placeholder: '+1 or -1',
                      onChange: this.handleDeltaUnits
                  })
                 )
              ),
            cE(rB.Col, {xs: 6, sm: 4, key: 2111},
               cE(rB.Button, {
                   onClick: this.doChangeUnits,
                   bsStyle: 'danger'
               }, 'Change')
              )
        ] : []);

        const fields2 = (this.props.privileged ? [
            cE(rB.Col, { xs: 8, sm: 4, key: 1355},
               cE(rB.FormGroup, {
                   controlId: 'appNameId'
               },
                  cE(rB.ControlLabel, null, 'App Name'),
                  cE(rB.FormControl, {
                      type: 'text',
                      value: this.props.appNameCost,
                      placeholder: 'user-myapp',
                      onChange: this.handleAppNameCost
                  })
                 )
              ),
            cE(rB.Col, {xs: 8, sm: 4, key: 1355},
               cE(rB.FormGroup, {
                   controlId: 'costId'
               },
                  cE(rB.ControlLabel, null, 'Cost'),
                  cE(rB.FormControl, {
                      type: 'text',
                      value: this.props.cost,
                      placeholder: 'Days per unit',
                      onChange: this.handleCost
                  })
                 )
              ),
            cE(rB.Col, {xs: 4, sm: 4, key: 1111},
               cE(rB.Button, {
                   onClick: this.doChangeCost,
                   bsStyle: 'danger'
               }, 'Change')
              )
        ] : []);

        const fields3 = (this.props.privileged ? [
            cE(rB.Col, {xs: 6, sm: 6, key: 81111},
               cE(rB.Button, {
                   onClick: this.doUpdateUsage,
                   bsStyle: 'danger'
               }, 'Update App Usage')
              )
        ] : []);

        let allUsers = this.props.allUsers || [];
        allUsers = allUsers.map(x => ({value: x, label: x}));

        return cE(rB.Grid, {fluid: true},
                  cE(rB.Row, null,
                     cE(rB.Col, {xs:8, sm:4},
                        cE(rB.FormGroup, {controlId: 'selectId'},
                            cE(rB.ControlLabel, null, 'Username'),
                           (this.props.privileged ?
                            cE(Select, {options: allUsers,
                                        instanceId: 'management-panel-1',
                             //           value: this.props.username,
                                        onChange: this.handleSelectChange}) :
                            cE(rB.FormControl, {
                                readOnly: true,
                                type: 'text',
                                value: this.props.username
                            })
                           )
                          )
                       ),
                     cE(rB.Col, {xs:4 , sm:4},
                        cE(rB.FormGroup, {controlId: 'unitsId'},
                            cE(rB.ControlLabel, null, 'Units'),
                            cE(rB.FormControl, {
                                readOnly: true,
                                type: 'text',
                                value: this.props.units
                            })
                          )
                       ),
                     cE(rB.Col, {xs:12 , sm:4},
                        cE(rB.FormGroup, {controlId: 'exchangeId'},
                           cE(rB.ControlLabel, null, 'Exchange'),
                           cE(rB.ButtonGroup, {block: true},
                              cE(rB.Button,  {
                                  onClick: this.doTransfer,
                                  bsStyle: 'danger'
                           }, 'Transfer'),
                              cE(rB.Button,  {
                                  onClick: this.doAccept,
                                  bsStyle: (this.props.pendingAccepts ?
                                            'warning' : 'primary')
                              }, 'Accept'),
                              cE(rB.Button,  {
                                  onClick: this.doQuery,
                                  bsStyle: 'info'
                              }, 'Query')
                             )
                          )
                       )
                    ),
                  cE(rB.Row, {className: 'row-center-align'}, fields),
                  cE(rB.Row, {className: 'row-center-align'}, fields2),
                  cE(rB.Row, {className: 'row-center-align'}, fields3)
                 );
    }
};

module.exports = ManagementPanel;
