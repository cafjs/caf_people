'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const AppActions = require('../actions/AppActions');
const TableApps = require('./TableApps');
const TableCAs = require('./TableCAs');
const AppStatus = require('./AppStatus');
const NewError = require('./NewError');
const ManagementPanel = require('./ManagementPanel');
const Transfer = require('./Transfer');
const Accept = require('./Accept');
const Query = require('./Query');
const AppInfo = require('./AppInfo');
const AppUsage = require('./AppUsage');
const Buy = require('./Buy');

const cE = React.createElement;

class MyApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.ctx.store.getState();
    }

    componentDidMount() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.props.ctx.store
                .subscribe(this._onChange.bind(this));
            this._onChange();
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    _onChange() {
        if (this.unsubscribe) {
            this.setState(this.props.ctx.store.getState());
        }
    }

    render() {
        const pendingAccepts = this.state.userInfo.accepts &&
                (Object.keys(this.state.userInfo.accepts).length > 0);

        return cE("div", {className: "container-fluid"},
                  cE(AppInfo, {
                      ctx: this.props.ctx,
                      appInfo: this.state.appInfo
                  }),
                  cE(AppUsage, {
                      ctx: this.props.ctx,
                      appUsage: this.state.appUsage
                  }),
                  cE(Transfer, {
                      ctx: this.props.ctx,
                      transferMode: this.state.transferMode,
                      transferUsername: this.state.transferUsername,
                      transferUnits: this.state.transferUnits,
                      transfers: this.state.userInfo.offers || {}
                  }),
                  cE(Accept, {
                      ctx: this.props.ctx,
                      acceptMode: this.state.acceptMode,
                      accepts: this.state.userInfo.accepts || {}
                  }),
                  cE(Query, {
                      ctx: this.props.ctx,
                      queryMode: this.state.queryMode,
                      queryUsername: this.state.queryUsername,
                      myStats: this.state.userInfo.reputation,
                      stats: this.state.stats
                  }),
                  cE(Buy, {
                      ctx: this.props.ctx,
                      buyMode: this.state.buyMode,
                      buyUnits: this.state.buyUnits,
                      price: this.state.price
                  }),
                  cE(NewError, {
                      ctx: this.props.ctx, error: this.state.error
                  }),

                  cE(rB.Panel, null,
                     cE(rB.Panel.Heading, null,
                        cE(rB.Panel.Title, null,
                           cE(rB.Grid, {fluid: true},
                              cE(rB.Row, null,
                                 cE(rB.Col, {sm:1, xs:1},
                                    cE(AppStatus, {
                                        isClosed: this.state.isClosed
                                    })
                                   ),
                                 cE(rB.Col, {
                                     sm: 5,
                                     xs:10,
                                     className: 'text-right'
                                 }, "People"),
                                 cE(rB.Col, {
                                     sm: 5,
                                     xs:11,
                                     className: 'text-right'
                                 }, this.state.fullName)
                                )
                             )
                          )
                       ),
                     cE(rB.Panel.Body, null,
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, "User")
                             ),
                           cE(rB.Panel.Body, null,
                              cE(ManagementPanel, {
                                  ctx: this.props.ctx,
                                  units: this.state.userInfo.user || 0,
                                  username: this.state.username,
                                  allUsers: this.state.allUsers,
                                  privileged: this.state.privileged,
                                  pendingId: this.state.pendingId,
                                  deltaUnits: this.state.deltaUnits,
                                  changeUnitsId: this.state.changeUnitsId,
                                  pendingAccepts: pendingAccepts,
                                  cost: this.state.cost,
                                  appNameCost: this.state.appNameCost
                              })
                             )
                          ),
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, "Applications")
                             ),
                           cE(rB.Panel.Body, null,
                              cE(TableApps, {
                                  ctx: this.props.ctx,
                                  apps: this.state.userInfo.apps
                              })
                             )
                          ),
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, "CAs")
                             ),
                           cE(rB.Panel.Body, null,
                              cE(TableCAs, {cas: this.state.userInfo.cas})
                             )
                          )
                       )
                    )
                 );
    }
};

module.exports = MyApp;
