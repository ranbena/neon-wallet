// @flow
import React, { Component, Fragment } from 'react'
import jsqr from 'jsqr'
import { get } from 'lodash-es'

import Loading from '../../containers/App/Loading'
import { ConditionalLink } from '../../util/ConditionalLink'
import ErrorIcon from '../../assets/icons/error.svg'

import styles from './QrCodeScanner.scss'

// const SCANNER_INTERVAL = 500
const PAUSE_DURATION = 4000

type ScannerError = {
  message: string,
  details?: React$Element<*>
}

type Props = {
  callback: (content: string, stopScanner: Function) => any,
  width: number,
  height: number,
  theme: string
}

type State = {
  loading: boolean,
  error: ?ScannerError
}

export default class QrCodeScanner extends Component<Props, State> {
  state = {
    loading: false,
    error: null
  }

  video: ?HTMLVideoElement

  canvas: ?HTMLCanvasElement

  canvasCtx: CanvasRenderingContext2D

  stream: ?MediaStream

  rafId: ?AnimationFrameID

  pauseTimeoutId: ?TimeoutID

  componentDidMount() {
    const { canvas } = this
    if (canvas) {
      this.canvasCtx = canvas.getContext('2d')

      this.setState({ loading: true }, async () => {
        await this.startScanner()
        this.setState({ loading: false })
      })
    }
  }

  componentWillUnmount() {
    this.stopScanner()
  }

  async startScanner() {
    const { video } = this
    if (video) {
      // injects a stream from first camera to <video>
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true
      })
      video.srcObject = this.stream
      video.play()
      this.rafId = requestAnimationFrame(this.tick.bind(this))
    }
  }

  stopScanner() {
    // cancel scan
    window.cancelAnimationFrame(this.rafId)
    // cancel pause
    window.clearTimeout(this.pauseTimeoutId)
    // stop stream
    if (this.stream) {
      this.stream.getTracks().forEach(trk => trk.stop())
    }
  }

  tick() {
    const { video } = this
    const { callback } = this.props
    if (video) {
      // skip till video ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        this.rafId = requestAnimationFrame(this.tick.bind(this))
      }

      // capture and scan image
      const { width: w, height: h } = this.props
      this.canvasCtx.drawImage(video, 0, 0, w, h)
      const { data, height, width } = this.canvasCtx.getImageData(0, 0, w, h)
      const result = jsqr(data, width, height, {
        inversionAttempts: 'dontInvert' // don't check white on black
      })

      if (result) {
        // pause scan and execute callback
        this.pause()
        callback(result.data, this.stopScanner)
      } else {
        // continue
        this.rafId = requestAnimationFrame(this.tick.bind(this))
      }
    }
  }

  pause() {
    // this.setState({ loading: true })
    this.pauseTimeoutId = setTimeout(() => this.resume(), PAUSE_DURATION)
  }

  resume() {
    // this.setState({ loading: false })
    requestAnimationFrame(this.tick.bind(this))
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
    const { loading } = this.state

    return loading ? <Loading theme={theme} nobackground /> : null
  }

  renderScanner() {
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

    const { width, height } = this.props
    return (
      <Fragment>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={el => {
            this.video = el
          }}
          width={width}
          height={height}
        />
        <canvas
          hidden
          ref={el => {
            this.canvas = el
          }}
          width={width}
          height={height}
        />
      </Fragment>
    )
  }
}
