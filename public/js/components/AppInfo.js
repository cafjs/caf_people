'use strict';
const React = require('react');
const rB = require('react-bootstrap');
const AppActions = require('../actions/AppActions');
const cE = React.createElement;
const rC = require('recharts');

const HEIGHT = 350;
const ALL_PROPS = ['cpuActual', 'cpuRequested', 'memoryActual',
                   'memoryRequested', 'egressActual'];

const maxLengths = (data) => {
    const lengths = [0];
    if (data) {
        if (data.redis) {
            ALL_PROPS.forEach(x => {
                data.redis[x] && lengths.push(data.redis[x].length);
            });
        }

        if (data.app) {
            ALL_PROPS.forEach(x => {
                data.app[x] && lengths.push(data.app[x].length);
            });
        }
    }

    return Math.max(...lengths);
};


const processData = function(data) {
    const patchArray = (outArr, inArr, prop) => {
        if (Array.isArray(inArr)) {
            for (let i=0; i<inArr.length; i++) {
                outArr[i][prop] = inArr[i];
            }
        }
    };

    if (data) {
        const result = [];
        const maxL = maxLengths(data);
        for (let i=0; i<maxL; i++) {
            result.push({days: i});
        }

        if (data.redis) {
            patchArray(result, data.redis.cpuActual, 'cpuActualRedis');
            patchArray(result, data.redis.cpuRequested, 'cpuRequestedRedis');
            patchArray(result, data.redis.memoryActual, 'memoryActualRedis');
            patchArray(result, data.redis.memoryRequested,
                       'memoryRequestedRedis');
            patchArray(result, data.redis.egressActual, 'egressActualRedis');
        }

        if (data.app) {
            patchArray(result, data.app.cpuActual, 'cpuActualApp');
            patchArray(result, data.app.cpuRequested, 'cpuRequestedApp');
            patchArray(result, data.app.memoryActual, 'memoryActualApp');
            patchArray(result, data.app.memoryRequested, 'memoryRequestedApp');
            patchArray(result, data.app.egressActual, 'egressActualApp');
        }

        return result;
    } else {
        return null;
    }
};

class AppInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {isRedis: false, metric: 'cpu'};
        this.doDismiss = this.doDismiss.bind(this);
        this.handleIsRedis = this.handleIsRedis.bind(this);
        this.handleMetric = this.handleMetric.bind(this);
    }

    handleIsRedis(e) {
        this.setState({isRedis: e});
    }

    handleMetric(e) {
        this.setState({metric: e});
    }

    doDismiss() {
        AppActions.setLocalState(this.props.ctx, {appInfo: null});
    }

    render() {
        const data = processData(this.props.appInfo) || [];
        const startDate = this.props.appInfo &&
              (new Date(this.props.appInfo.startTime)).toISOString()
              .split('T')[0];
        const isCPU = this.state.metric === 'cpu';
        const isMem = this.state.metric === 'mem';
        const isNet = this.state.metric === 'net';

        return cE(rB.Modal,{show: !!this.props.appInfo,
                            onHide: this.doDismiss,
                            animation: false},
                  cE(rB.Modal.Header, {closeButton: true},
                     cE(rB.Modal.Title, null, 'Stats for ' +
                        ((this.props.appInfo && this.props.appInfo.appName) ||
                         '?')
                       )
                    ),
                  cE(rB.ModalBody, null,
                     cE(rC.ResponsiveContainer, {height: HEIGHT, width: '100%'},
                        cE(rC.LineChart, {data},
                           [
                               cE(rC.XAxis, {key: 1000, dataKey: 'days'},
                                  cE(rC.Label, {
                                      value: (this.state.isRedis ?
                                              'Redis: Days after ' :
                                              'App: Days after ') + startDate,
                                      position: 'insideBottom',
                                      offset: 0
                                  })
                                 ),
                               isNet &&
                                   cE(rC.YAxis, {key: 1001,
                                                 label: {
                                                     value: 'MBytes (Egress)',
                                                     angle: -90,
                                                     position: 'insideLeft'
                                                 }}),
                               isCPU &&
                                   cE(rC.YAxis, {key: 1002,
                                                 label: {
                                                     value: 'Cores',
                                                     angle: -90,
                                                     position: 'insideLeft'
                                                 }}),
                               isMem &&
                                   cE(rC.YAxis, {key: 1003,
                                                 label: {
                                                     value: 'MBytes',
                                                     angle: -90,
                                                     position: 'insideLeft'
                                                 }}),

                               cE(rC.Legend, {key: 998, verticalAlign: 'top'}),
                               cE(rC.Tooltip, {key: 888}),

                               isCPU && this.state.isRedis &&
                                   cE(rC.Line, {key: 1003,
                                                isAnimationActive: false,
                                                dataKey: 'cpuActualRedis',
                                                type: 'monotone',
                                                stroke: '#ff0000'}),
                               isCPU && this.state.isRedis &&
                                   cE(rC.Line, {key: 1004,
                                                isAnimationActive: false,
                                                dataKey: 'cpuRequestedRedis',
                                                type: 'monotone',
                                                stroke: '#0000ff'}),
                               isMem && this.state.isRedis &&
                                   cE(rC.Line, {key: 1005,
                                                isAnimationActive: false,
                                                dataKey: 'memoryActualRedis',
                                                type: 'monotone',
                                                stroke: '#ff0000'}),
                               isMem && this.state.isRedis &&
                                   cE(rC.Line, {key: 1006,
                                                isAnimationActive: false,
                                                dataKey: 'memoryRequestedRedis',
                                                type: 'monotone',
                                                stroke: '#0000ff'}),
                               isNet && this.state.isRedis &&
                                   cE(rC.Line, {key: 1007,
                                                isAnimationActive: false,
                                                dataKey: 'egressActualRedis',
                                                type: 'monotone',
                                                stroke: '#ff0000'}),

                               isCPU && !this.state.isRedis &&
                                   cE(rC.Line, {key: 1008,
                                                isAnimationActive: false,
                                                dataKey: 'cpuActualApp',
                                                type: 'monotone',
                                                stroke: '#ff0000'}),
                               isCPU && !this.state.isRedis &&
                                   cE(rC.Line, {key: 1009,
                                                isAnimationActive: false,
                                                dataKey: 'cpuRequestedApp',
                                                type: 'monotone',
                                                stroke: '#0000ff'}),
                               isMem && !this.state.isRedis &&
                                   cE(rC.Line, {key: 1010,
                                                isAnimationActive: false,
                                                dataKey: 'memoryActualApp',
                                                type: 'monotone',
                                                stroke: '#ff0000'}),
                               isMem && !this.state.isRedis &&
                                   cE(rC.Line, {key: 1011,
                                                isAnimationActive: false,
                                                dataKey: 'memoryRequestedApp',
                                                type: 'monotone',
                                                stroke: '#0000ff'}),
                               isNet && !this.state.isRedis &&
                                   cE(rC.Line, {key: 1012,
                                                isAnimationActive: false,
                                                dataKey: 'egressActualApp',
                                                type: 'monotone',
                                                stroke: '#ff0000'})
                           ].filter(x => !!x)
                          )
                       ),
                     cE(rB.ButtonToolbar, null,
                        cE(rB.ToggleButtonGroup, {
                            type: 'radio',
                            name : 'target',
                            value: this.state.isRedis,
                            onChange: this.handleIsRedis
                        },
                           cE(rB.ToggleButton, {value: true}, 'Redis'),
                           cE(rB.ToggleButton, {value: false}, 'App')
                          )
                       ),
                     cE(rB.ButtonToolbar, null,
                        cE(rB.ToggleButtonGroup, {
                            type: 'radio',
                            name : 'metric',
                            value: this.state.metric,
                            onChange: this.handleMetric
                        },
                           cE(rB.ToggleButton, {value: 'cpu'}, 'CPUs'),
                           cE(rB.ToggleButton, {value: 'mem'}, 'Memory'),
                           cE(rB.ToggleButton, {value: 'net'}, 'Network')
                          )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doDismiss}, 'Continue')
                    )
                 );
    }
}

module.exports = AppInfo;
