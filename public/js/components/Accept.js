var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');
var TableAccept = require('./TableAccept');

class Accept extends React.Component {
    constructor(props) {
        super(props);
        this.doDismiss = this.doDismiss.bind(this);
    }

    doDismiss(ev) {
        AppActions.setLocalState(this.props.ctx, {
            acceptMode: false
        });
    }

    render() {
        return cE(rB.Modal,{show: !!this.props.acceptMode,
                            onHide: this.doDismiss,
                            animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-warning text-warning',
                      closeButton: true
                  }, cE(rB.Modal.Title, null, 'Accept')),
                  cE(rB.Modal.Body, null,
                     cE(TableAccept, {
                         ctx: this.props.ctx,
                         accepts: this.props.accepts
                     })
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doDismiss}, "Continue")
                    )
                 );
    }
};

module.exports = Accept;
