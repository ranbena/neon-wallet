// @flow
import React, { Fragment } from 'react'
import Instascan from 'instascan'

import Button from '../../components/Button'
import PasswordInput from '../../components/Inputs/PasswordInput/PasswordInput'
import Loading from '../App/Loading'
import LoginIcon from '../../assets/icons/login.svg'
import GridIcon from '../../assets/icons/grid.svg'
import Close from '../../assets/icons/close.svg'
import ErrorIcon from '../../assets/icons/error.svg'
import { ConditionalLink } from '../../util/ConditionalLink'
import styles from '../Home/Home.scss'

type ScannerError = {
  message: string,
  details?: React$Element<*>
}

type Props = {
  loginWithPrivateKey: Function,
  cameraAvailable: boolean,
  theme: string
}

type State = {
  wif: string,
  scannerActive: boolean,
  loading: boolean,
  error: ?ScannerError
}

export default class LoginPrivateKey extends React.Component<Props, State> {
  scannerInstance: Instascan

  scanPreviewElement: ?HTMLVideoElement

  state = {
    wif: '',
    scannerActive: false,
    loading: false,
    error: null
  }

  componentWillUnmount() {
    this.stopScanner()
  }

  render = () => {
    const { loginWithPrivateKey, cameraAvailable } = this.props
    const { wif, scannerActive } = this.state

    return (
      <div id="loginPrivateKey" className={styles.flexContainer}>
        <form
          onSubmit={e => {
            e.preventDefault()
            loginWithPrivateKey(wif)
          }}
        >
          {scannerActive ? (
            <React.Fragment>
              <div className={styles.scannerContainer}>
                {this.renderLoadingIndicator()}
                {this.renderScanner()}
              </div>
              <div className={styles.privateKeyLoginButtonRowScannerActive}>
                <Button
                  id="scan-private-key-qr-button"
                  renderIcon={Close}
                  onClick={this.toggleScanner}
                >
                  Cancel
                </Button>
              </div>
            </React.Fragment>
          ) : (
            <Fragment>
              <div className={styles.centeredInput}>
                <PasswordInput
                  placeholder="Enter your private key here"
                  value={wif}
                  onChange={(e: Object) =>
                    this.setState({ wif: e.target.value })
                  }
                  autoFocus
                />
              </div>
              <div className={styles.privateKeyLoginButtonRow}>
                <Button
                  id="scan-private-key-qr-button"
                  primary
                  renderIcon={GridIcon}
                  onClick={this.toggleScanner}
                  disabled={!cameraAvailable}
                >
                  Scan QR
                </Button>
                <Button
                  id="loginButton"
                  primary
                  type="submit"
                  renderIcon={LoginIcon}
                  disabled={wif.length < 10}
                >
                  Login
                </Button>
              </div>
            </Fragment>
          )}
        </form>
      </div>
    )
  }

  toggleScanner = () => {
    this.setState(
      prevState => ({ scannerActive: !prevState.scannerActive }),
      () => {
        if (this.state.scannerActive) return this.startScanner()
        return this.stopScanner()
      }
    )
  }

  stopScanner() {
    if (this.scannerInstance) this.scannerInstance.stop()
    this.setState({ error: null }) // clear error
  }

  startScanner() {
    const { loginWithPrivateKey } = this.props
    this.scannerInstance = new Instascan.Scanner({
      video: this.scanPreviewElement
    })

    this.scannerInstance.addListener('scan', content => {
      loginWithPrivateKey(content)
    })

    this.setState({ loading: true })

    // since the browser halts while getting usermedia
    // let the loading animation finish one round and only then continue
    new Promise(resolve => setTimeout(resolve, 900))
      .then(() => Instascan.Camera.getCameras())
      .then((cams: Array<Object>) => {
        if (cams.length === 0) {
          // shouldn't happen, case covered by withCameraAvailability
          throw new Error()
        }
        return this.scannerInstance.start(cams[0])
      })
      .catch(err => {
        this.setState({ error: this.constructor.getScannerError(err) })
      })
      .finally(() => {
        this.setState({ loading: false })
      })
  }

  static getScannerError(err: Error) {
    const scanErr: ScannerError = {
      message: 'Could not connect to camera'
    }

    if (err.name === 'TrackStartError') {
      // get link info by user os, defaults to nothing
      const [link, title] =
        {
          darwin: [
            'https://support.apple.com/en-il/guide/mac-help/mh32356/10.14/mac',
            'MacOS User Guide: Change Privacy preferences'
          ],
          win32: [
            'https://support.microsoft.com/en-ca/help/10557/windows-10-app-permissions',
            'Windows Support: App permissions'
          ],
          linux: [
            'https://wiki.ubuntu.com/SecurityPermissions',
            'Ubuntu Wiki: Security Permissions'
          ]
        }[process.platform] || []

      scanErr.details = (
        <div>
          Make sure your camera is not already in use by another program and
          that{' '}
          <ConditionalLink href={link} tooltip={title} target="_blank">
            camera access
          </ConditionalLink>{' '}
          is granted to Neon.
        </div>
      )
    }
    return scanErr
  }

  renderLoadingIndicator(): ?React$Element<'div'> {
    const { theme } = this.props
    const { loading } = this.state

    return loading ? Loading({ theme }) : null
  }

  renderScanner(): React$Element<*> {
    const { error } = this.state

    if (error) {
      return (
        <div className={styles.error}>
          <div className={styles.heading}>
            <ErrorIcon /> {error.message}
          </div>
          <div className={styles.desc}>{error.details}</div>
        </div>
      )
    }

    return (
      /* eslint-disable-next-line jsx-a11y/media-has-caption */
      <video
        ref={ref => {
          this.scanPreviewElement = ref
        }}
      />
    )
  }
}
