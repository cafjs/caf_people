'use strict';
const React = require('react');
const rB = require('react-bootstrap');
const AppActions = require('../actions/AppActions');
const cE = React.createElement;
const rC = require('recharts');

const HEIGHT = 350;

const processData = function(data) {
    if (Array.isArray(data) && (data.length > 0)) {
        const appName = data[0].appName;
        const startTime = data[0].timestamp; //assumed ordered
        const result = data.map((x) => {
            return {
                days: Math.floor((x.timestamp - startTime)/(10*24*60*60))/100,
                count: x.count
            };
        });
        return [appName, startTime, result];
    } else {
        return null;
    }
};

class AppUsage extends React.Component {

    constructor(props) {
        super(props);
        this.doDismiss = this.doDismiss.bind(this);
    }

    doDismiss() {
        AppActions.setLocalState(this.props.ctx, {appUsage: null});
    }

    render() {
        const [appName, startTime, data] =
              processData(this.props.appUsage) || ['?', 0, []];
        const startDate = (new Date(startTime)).toISOString().split('T')[0];

        return cE(rB.Modal,{show: !!this.props.appUsage,
                            onHide: this.doDismiss,
                            animation: false},
                  cE(rB.Modal.Header, {closeButton: true},
                     cE(rB.Modal.Title, null, 'Usage for ' + appName)
                    ),
                  cE(rB.ModalBody, null,
                     cE(rC.ResponsiveContainer, {height: HEIGHT, width: '100%'},
                        cE(rC.LineChart, {data},
                           cE(rC.XAxis, {dataKey: 'days', type: 'number',
                                         allowDecimals: false},
                              cE(rC.Label, {
                                  value: 'Days after ' + startDate,
                                  position: 'insideBottom',
                                  offset: 0
                              })
                             ),
                           cE(rC.YAxis, {
                               label: {
                                   value: 'Active CAs',
                                   angle: -90,
                                   position: 'insideLeft'
                               }}
                             ),
                           cE(rC.Legend, {verticalAlign: 'top'}),
                           cE(rC.Tooltip, null),
                           cE(rC.Line, {isAnimationActive: false,
                                        dataKey: 'count',
                                        type: 'monotone',
                                        stroke: '#0000ff'}
                             )
                          )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doDismiss}, 'Continue')
                    )
                 );
    }
}

module.exports = AppUsage;
