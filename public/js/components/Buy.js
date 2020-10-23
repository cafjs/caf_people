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

        if (!isNaN(units)) {
            AppActions.getPrice(this.props.ctx, units);
        } else {
            AppActions.setLocalState(this.props.ctx, {
                price: ''
            });
        }
    }

    async createOrder(data, actions) {
        try {
            if (this.props.buyUnits &&
                (typeof this.props.buyUnits === 'number')) {
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
        } catch (err) {
            console.log('Error: cannot buy units, got error ' + err);
            AppActions.setError(this.props.ctx, err);
            return null;
        }
    }

    async onApprove(data, actions) {
        try {
            const order = await AppActions.captureOrder(this.props.ctx,
                                                        data.orderID);
            AppActions.setLocalState(this.props.ctx, {
                capturedOrder: order
            });
            this.doDismiss();
        } catch (err) {
            console.log('Error: cannot capture funds, got error ' + err);
            AppActions.setError(this.props.ctx, err);
        }
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
                                 cE(rB.Col, {sm:2, xs:4},
                                    cE(rB.ControlLabel, null, 'Units')
                                   ),
                                 cE(rB.Col, {sm:3, xs:8},
                                    cE(rB.FormControl, {
                                        type: 'text',
                                        value: this.props.buyUnits,
                                        placeholder: 'units',
                                        onChange: this.handleBuyUnits
                                    })),
                                 cE(rB.Col, {sm:2, xs:4},
                                    cE(rB.ControlLabel, null, 'Price')
                                   ),
                                 cE(rB.Col, {sm:3, xs:8},
                                    cE(rB.FormControl, {
                                        type: 'text',
                                        value: this.props.price ?
                                            `$${this.props.price}` :
                                            this.props.price,
                                        readOnly: true,
                                        placeholder: '$'
                                    })),
                                 cE(rB.Col, {sm:2, xs:4},
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
