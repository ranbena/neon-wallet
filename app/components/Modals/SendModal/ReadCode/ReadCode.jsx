// @flow
import React, { Fragment } from 'react'
import classNames from 'classnames'
import { type ProgressState } from 'spunky'

import GridIcon from 'assets/icons/grid.svg'
import CozDonationQrCode from 'assets/images/coz-donation-qr-code.png'
import Button from '../../../Button'
import QrCodeScanner from '../../../QrCodeScanner'

import baseStyles from '../SendModal.scss'
import styles from './ReadCode.scss'

type Props = {
  callback: (content: string) => void,
  callbackProgress: ProgressState,
  cameraAvailable: boolean
}

type State = {
  scannerActive: boolean
}

export default class ReadCode extends React.Component<Props, State> {
  state = {
    scannerActive: false
  }

  toggleScanner = () => {
    this.setState(prevState => ({ scannerActive: !prevState.scannerActive }))
  }

  getScanner = () => {
    if (this.state.scannerActive) {
      const { callback, callbackProgress } = this.props
      return (
        <QrCodeScanner
          callback={callback}
          callbackProgress={callbackProgress}
          width={350}
          height={218}
        />
      )
    }

    return (
      <Fragment>
        <div className={styles.frameLineTopRight} />
        <div className={styles.frameLineTopLeft} />
        <div className={styles.frameLineBottomRight} />
        <div className={styles.frameLineBottomLeft} />
        <img src={CozDonationQrCode} alt="coz-donation-qr-code.png" />
      </Fragment>
    )
  }

  render() {
    const { cameraAvailable } = this.props
    const { scannerActive } = this.state

    return (
      <div className={baseStyles.contentContainer}>
        <div className={baseStyles.header}>
          <GridIcon className={baseStyles.icon} />
          <div className={baseStyles.title}>Use a QR Code</div>
        </div>

        <div className={baseStyles.divider} />

        <div className={baseStyles.section}>
          <div className={baseStyles.sectionContent}>
            So you've been given a QR code? Click capture and hold it up to your
            camera.
          </div>
        </div>

        <div className={baseStyles.section}>
          <div className={baseStyles.sectionTitle}>CAPTURE</div>
          <div
            className={classNames(
              baseStyles.sectionContent,
              styles.qrCodeScannerSection
            )}
          >
            <div className={styles.qrCodeScannerPlaceholder}>
              {this.getScanner()}
            </div>
          </div>
        </div>
        <div className={styles.scanButtonContainer}>
          <Button
            primary
            onClick={this.toggleScanner}
            disabled={!scannerActive && !cameraAvailable}
          >
            {scannerActive ? 'Cancel' : 'Capture'}
          </Button>
        </div>
      </div>
    )
  }
}
