// @flow
import React, { Component, Fragment } from 'react'
import jsqr from 'jsqr'
import { get, assign } from 'lodash-es'
import { type ProgressState, progressValues } from 'spunky'

import Loading from '../../containers/App/Loading'
import { ConditionalLink } from '../../util/ConditionalLink'
import ErrorIcon from '../../assets/icons/error.svg'
import Overlay from '../../assets/images/qr-marker.svg'

import styles from './QrCodeScanner.scss'
import themes from '../../themes'

const PAUSE_DELAY = 2000
const JSQR_OPTIONS = {
  inversionAttempts: 'dontInvert' // don't check white on black
}
const { FAILED, LOADING } = progressValues

type ScannerError = {
  message: string,
  details?: React$Element<*>
}

type Props = {
  callback: (content: string) => any,
  callbackProgress: ProgressState,
  theme: string
}

type State = {
  loading: boolean,
  paused: boolean,
  error: ?ScannerError
}

export default class QrCodeScanner extends Component<Props, State> {
  state = {
    loading: true,
    paused: false,
    error: null
  }

  video: HTMLVideoElement = document.createElement('video')

  canvas: ?HTMLCanvasElement

  canvasCtx: CanvasRenderingContext2D

  stream: ?MediaStream

  rafId: ?AnimationFrameID

  animTimeoutId: ?TimeoutID

  primaryColor: string

  secondaryColor: string

  dimensions: { width: number, height: number }

  componentDidMount() {
    const { canvas, props } = this
    const { theme } = props

    this.primaryColor = themes[theme]['--qr-scan-primary']
    this.secondaryColor = themes[theme]['--qr-scan-secondary']

    if (canvas) {
      this.canvasCtx = canvas.getContext('2d')
      this.startScanner()
    }
  }

  componentDidUpdate(prevProps: Props) {
    // resume if callback progressed from LOADING to FAILED
    if (
      this.state.paused &&
      this.props.callbackProgress === FAILED &&
      prevProps.callbackProgress === LOADING
    ) {
      this.resume()
    }
  }

  componentWillUnmount() {
    this.stopScanner()
  }

  startScanner() {
    navigator.mediaDevices
      .getUserMedia({
        video: true
      })
      .then(stream => {
        this.stream = stream // stored for later stopping
        this.video.srcObject = stream
        this.video.play()
        this.scan()
      })
      .catch(err => {
        this.setState({ error: this.constructor.getScannerError(err) })
      })
      .finally(() => {
        this.setState({ loading: false })
      })
  }

  stopScanner() {
    // cancel scan
    window.cancelAnimationFrame(this.rafId)
    // cancel animation
    window.clearTimeout(this.animTimeoutId)
    // stop stream
    if (this.stream) {
      this.stream.getTracks().forEach(trk => trk.stop())
    }
  }

  scan() {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      const { width: w, height: h } = this.dimensions

      // capture and scan image
      this.canvasCtx.drawImage(this.video, 0, 0, w, h)
      const { data, width, height } = this.canvasCtx.getImageData(0, 0, w, h)
      const code: { data: string } = jsqr(data, width, height, JSQR_OPTIONS)

      // qr code found
      if (code) {
        this.setState({ paused: true })
        setTimeout(() => this.props.callback(code.data), PAUSE_DELAY)
      } else {
        this.rafId = requestAnimationFrame(this.scan.bind(this))
      }
    } else {
      this.rafId = requestAnimationFrame(this.scan.bind(this))
    }
  }

  get dimensions() {
    // get from video
    const dimensions = {
      width: this.video.videoWidth,
      height: this.video.videoHeight
    }
    // set to canvas
    assign(this.canvas, dimensions)

    // memoize
    Object.defineProperty(this, 'dimensions', { value: dimensions })

    return dimensions
  }

  resume() {
    this.setState({ paused: false })
    window.clearTimeout(this.animTimeoutId) // stop animation
    this.scan()
  }

  static getScannerError(err: Error) {
    const scanErr: ScannerError = {
      message: 'Could not connect to camera'
    }

    if (err.name === 'TrackStartError') {
      // get link info by user os, defaults to nothing
      const docs = {
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
      }
      const [link, title] = get(docs, process.platform, [])

      scanErr.details = (
        <div>
          Make sure your camera is not already in use by another program and
          that{' '}
          <ConditionalLink href={link} tooltip={title}>
            camera access
          </ConditionalLink>{' '}
          is granted to Neon.
        </div>
      )
    }
    return scanErr
  }

  render() {
    return (
      <Fragment>
        {this.renderLoadingIndicator()}
        {this.renderScanner()}
      </Fragment>
    )
  }

  renderLoadingIndicator() {
    const { theme } = this.props
    const { loading, paused } = this.state

    return loading || paused ? (
      <Loading className={styles.loading} theme={theme} />
    ) : null
  }

  renderScanner() {
    const { error, paused } = this.state
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
      <Fragment>
        <canvas
          ref={el => {
            this.canvas = el
          }}
        />
        <Overlay className={styles.overlay} data-active={paused} />
      </Fragment>
    )
  }
}
