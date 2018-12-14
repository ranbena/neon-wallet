import { compose } from 'recompose'
import { withActions, withProgress, withData } from 'spunky'

import SendModal from './SendModal'
import {
  getRecipientData,
  removeRecipientData
} from '../../../actions/sendModalActions'
import withFailureNotification from '../../../hocs/withFailureNotification'

const mapGetDataToProps = action => ({
  getRecipientData: url => action.call(url)
})

const mapRemoveDataToProps = action => ({
  removeRecipientData: () => action.call()
})

const mapRecipientDataToProps = recipientData => ({ recipientData })

export default compose(
  withActions(getRecipientData, mapGetDataToProps),
  withData(getRecipientData, mapRecipientDataToProps),
  withFailureNotification(
    getRecipientData,
    message =>
      `An error occurred while scanning this QR code: ${message}. Please try again.`
  ),
  withProgress(getRecipientData),

  withActions(removeRecipientData, mapRemoveDataToProps),
  withData(removeRecipientData, mapRecipientDataToProps)
)(SendModal)
