var React = require('react');
var rB = require('react-bootstrap');
var Select = require('react-select').default;
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

class ManagementPanel extends React.Component {
    constructor(props) {
        super(props);

        this.handleDeltaUnits = this.handleDeltaUnits.bind(this);
        this.doChangeUnits = this.doChangeUnits.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }

    handleDeltaUnits(ev) {
        var deltaUnits = parseFloat(ev.target.value);
        deltaUnits = (isNaN(deltaUnits) ? ev.target.value : deltaUnits);
        AppActions.setLocalState(this.props.ctx, {
            deltaUnits: deltaUnits
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
        var username = user.value;
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
        var fields = (this.props.privileged ? [
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

        var allUsers = this.props.allUsers || [];
        allUsers = allUsers.map(x => ({value: x, label: x}));

        return cE(rB.Grid, {fluid: true},
                  cE(rB.Row, null,
                     cE(rB.Col, {xs:8, sm:8},
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
                     cE(rB.Col, {xs:4 , sm: 4},
                        cE(rB.FormGroup, {controlId: 'unitsId'},
                            cE(rB.ControlLabel, null, 'Units'),
                            cE(rB.FormControl, {
                                readOnly: true,
                                type: 'text',
                                value: this.props.units
                            })
                          )
                       )
                    ),
                  cE(rB.Row, {className: 'row-center-align'}, fields)
                 );
    }
};

module.exports = ManagementPanel;
