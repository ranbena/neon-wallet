// @flow
import React, { Component } from 'react'
import Transaction from '../../../../Blockchain/Transaction'

import styles from './SendSuccessTransaction.scss'

type Props = {
  asset: string,
  amount: string,
  address: string,
  txid: string
}

class SendSuccessTransaction extends Component<Props> {
  render() {
    const { asset: label, amount, address: to, txid } = this.props
    const tx = {
      txid,
      amount,
      to,
      label,
      iconType: 'SEND',
      isNetworkFee: false
    }
    return (
      <li className={styles.sendSuccessTransaction}>
        <Transaction className="txid" tx={tx} />
      </li>
    )
  }
}

export default SendSuccessTransaction
