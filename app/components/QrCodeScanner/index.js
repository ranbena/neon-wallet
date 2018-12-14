// @flow
import { compose } from 'recompose'

import { withError } from 'spunky'
import withThemeData from '../../hocs/withThemeData'
import QrCodeScanner from './QrCodeScanner'
import { wifLoginActions } from '../../actions/authActions'

const mapErrorToProps = (error: Error) => ({
  onLoginFail: error
})

export default compose(
  withError(wifLoginActions, mapErrorToProps),
  withThemeData()
)(QrCodeScanner)
