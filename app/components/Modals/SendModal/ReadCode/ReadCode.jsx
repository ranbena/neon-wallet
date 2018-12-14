// @flow
import React from 'react'
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
    const { callback, callbackProgress } = this.props
    if (this.state.scannerActive) {
      return (
        <QrCodeScanner
          callback={callback}
          callbackProgress={callbackProgress}
          height={260}
          width={350}
        />
      )
    }

    return <img src={CozDonationQrCode} alt="coz-donation-qr-code.png" />
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
              <div className="frameLineTopLeft" />
              <div className="frameLineTopRight" />
              <div className="frameLineBottomLeft" />
              <div className="frameLineBottomRight" />
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
