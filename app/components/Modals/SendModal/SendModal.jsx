// @flow
import React from 'react'
import { type ProgressState } from 'spunky'

import BaseModal from '../BaseModal'
import ReadCode from './ReadCode'
import ConfirmDetails from './ConfirmDetails'
import type { RecipientData } from '../../../util/parseQRCode'

type Props = {
  hideModal: () => any,
  pushQRCodeData: (data: Object) => any,
  getRecipientData: Function,
  removeRecipientData: Function,
  progress: ProgressState,
  recipientData: ?RecipientData
}

export default class SendModal extends React.Component<Props> {
  confirmAndClose = (recipientData: RecipientData) => {
    const { pushQRCodeData, hideModal } = this.props

    pushQRCodeData(recipientData)
    hideModal()
  }

  getStepComponent = () => {
    const { recipientData, progress, getRecipientData } = this.props
    return recipientData ? (
      <ConfirmDetails
        recipientData={recipientData}
        confirmAndClose={() => this.confirmAndClose(recipientData)}
      />
    ) : (
      <ReadCode callback={getRecipientData} callbackProgress={progress} />
    )
  }

  render() {
    const { hideModal, removeRecipientData, recipientData } = this.props
    return (
      <BaseModal
        style={{ content: { width: '775px', height: '100%' } }}
        backButtonAction={recipientData ? removeRecipientData : null}
        hideModal={hideModal}
      >
        {this.getStepComponent()}
      </BaseModal>
    )
  }
}
