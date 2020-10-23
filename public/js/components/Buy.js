const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const paypal = require('react-paypal-button-v2');
const AppActions = require('../actions/AppActions');


class Buy extends React.Component {
    constructor(props) {
        super(props);
        this.doDismiss = this.doDismiss.bind(this);
        this.handleBuyUnits = this.handleBuyUnits.bind(this);
        this.createOrder = this.createOrder.bind(this);
        this.onButtonReady = this.onButtonReady.bind(this);
        this.onApprove= this.onApprove(this);
        this.state = {showLoading: true};

    }

    handleBuyUnits(ev) {
        const units =  parseInt(ev.target.value);
        AppActions.setLocalState(this.props.ctx, {
            buyUnits: (isNaN(units) ? '' : units)
        });
    }

    async createOrder(data, actions) {
        if (this.props.buyUnits && (typeof this.props.buyUnits === 'number')) {
            const order = await AppActions.createOrder(this.props.ctx,
                                                    this.props.buyUnits);
            return order.id;
        } else {
            console.log('Error: cannot buy units, bad inputs ' +
                        JSON.stringify(this.props));
            AppActions.setError(this.props.ctx,
                                new Error('Cannot buy units, bad inputs'));
            return null;
        }
    }

    onApprove(data, actions) {


    }

    onButtonReady() {
        this.setState({showLoading: false});
    }

    doDismiss(ev) {
        AppActions.setLocalState(this.props.ctx, {
            buyMode: false
        });
    }

    render() {
        return cE(rB.Modal,{show: !!this.props.buyMode,
                            onHide: this.doDismiss,
                            animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-warning text-warning',
                      closeButton: true
                  }, cE(rB.Modal.Title, null, 'Purchase units')),
                  cE(rB.Modal.Body, null,
                     cE(rB.Grid, {fluid: true},
                        cE(rB.Row, null,
                           cE(rB.Form, {horizontal: true},
                              cE(rB.FormGroup, {controlId: 'formBuyUnits'},
                                 cE(rB.Col, {sm:2, xs:3},
                                    cE(rB.ControlLabel, null, 'Units')
                                   ),
                                 cE(rB.Col, {sm:4, xs:6},
                                    cE(rB.FormControl, {
                                        type: 'text',
                                        value: this.props.buyUnits,
                                        placeholder: 'units',
                                        onChange: this.handleBuyUnits
                                    })),
                                 cE(rB.Col, {sm:2, xs:3},
                                    [
                                        (this.state.showLoading ?
                                         cE('span', {key: 33},
                                            'Loading Button...') : null),
                                        cE(paypal.PayPalButton, {
                                            key: 53,
                                            createOrder: this.createOrder,
                                            onApprove: this.onApprove,
                                            onButtonReady: this.onButtonReady
                                        })
                                    ].filter(x => !!x)
                                   )
                                )
                             )
                          )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doDismiss}, "Continue")
                    )
                 );
    }
};

module.exports = Buy;
