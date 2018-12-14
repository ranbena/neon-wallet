// @flow
import React, { Component, Fragment } from 'react'
import jsqr from 'jsqr'
import { get } from 'lodash-es'

import Loading from '../../containers/App/Loading'
import { ConditionalLink } from '../../util/ConditionalLink'
import ErrorIcon from '../../assets/icons/error.svg'

import styles from './QrCodeScanner.scss'

const PAUSE_DURATION = 4000
const JSQR_OPTIONS = {
  inversionAttempts: 'dontInvert' // don't check white on black
}

type ScannerError = {
  message: string,
  details?: React$Element<*>
}

// won't be needed when we use TS
type jsqr$Point = { x: number, y: number }
type jsqr$Location = {
  topRightCorner: jsqr$Point,
  topLeftCorner: jsqr$Point,
  bottomRightCorner: jsqr$Point,
  bottomLeftCorner: jsqr$Point
}
type jsqr$Code = {
  data: string,
  location: jsqr$Location
}

type Props = {
  callback: (content: string, stopScanner: Function) => any,
  width: number,
  height: number,
  theme: string
}

type State = {
  loading: boolean,
  paused: boolean,
  error: ?ScannerError
}

let time = Date.now()

const log = (msg, reset) => {
  const now = Date.now()
  if (reset) {
    time = now
  }
  console.log(`${now - time} : ${msg}`)
  time = now
}

export default class QrCodeScanner extends Component<Props, State> {
  state = {
    loading: false,
    paused: false,
    error: null
  }

  video: ?HTMLVideoElement

  canvas: ?HTMLCanvasElement

  canvasCtx: CanvasRenderingContext2D

  stream: ?MediaStream

  rafId: ?AnimationFrameID

  pauseTimeoutId: ?TimeoutID

  marchTimeoutId: ?TimeoutID

  componentDidMount() {
    const { canvas } = this
    if (canvas) {
      this.canvasCtx = canvas.getContext('2d')

      log('start loading', true)
      this.setState({ loading: true }, async () => {
        log('startScanner')
        await this.startScanner()
        log('stop loading')
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

      // start scanning
      this.scan()
    }
  }

  stopScanner() {
    // cancel scan
    window.cancelAnimationFrame(this.rafId)
    // cancel pause and march
    window.clearTimeout(this.pauseTimeoutId)
    window.clearTimeout(this.marchTimeoutId)
    // stop stream
    if (this.stream) {
      this.stream.getTracks().forEach(trk => trk.stop())
    }
  }

  scan() {
    const { video } = this
    if (video) {
      // wait till video ready
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // capture and scan image
        const { width: w, height: h } = this.props
        this.canvasCtx.drawImage(video, 0, 0, w, h)
        const { data, height, width } = this.canvasCtx.getImageData(0, 0, w, h)
        const code = jsqr(data, width, height, JSQR_OPTIONS)
        if (code) {
          this.snap(code)
        } else {
          this.rafId = requestAnimationFrame(this.scan.bind(this))
        }
      } else {
        this.rafId = requestAnimationFrame(this.scan.bind(this))
      }
    }
  }

  snap(code: jsqr$Code) {
    // pause
    this.pause()

    // visual effect
    this.drawLines(code.location)

    // send to parent
    this.props.callback(code.data, this.stopScanner)
  }

  drawLines(loc: jsqr$Location) {
    const {
      topLeftCorner: tl,
      topRightCorner: tr,
      bottomRightCorner: br,
      bottomLeftCorner: bl
    } = loc

    // create path around qr code
    const path = new Path2D()
    path.moveTo(tl.x, tl.y)
    path.lineTo(tr.x, tr.y)
    path.lineTo(br.x, br.y)
    path.lineTo(bl.x, bl.y)
    path.lineTo(tl.x, tl.y)
    path.closePath()

    // glow
    this.canvasCtx.setLineDash([])
    this.canvasCtx.lineWidth = 10
    this.canvasCtx.shadowBlur = 60
    this.canvasCtx.shadowColor = '#66ED87'
    this.canvasCtx.strokeStyle = '#66ED87'
    this.canvasCtx.stroke(path)

    // marching ants
    this.march(path, 0)
  }

  march(path: Path2D, passedOffset: number) {
    // base line color

    this.canvasCtx.lineWidth = 3
    this.canvasCtx.setLineDash([])
    this.canvasCtx.shadowColor = ''
    this.canvasCtx.shadowBlur = 0
    this.canvasCtx.strokeStyle = '#66ED87'
    this.canvasCtx.stroke(path)

    // calculate animation line offset
    let offset = passedOffset + 1
    if (offset > 6) {
      offset = 0
    }

    // style it
    this.canvasCtx.setLineDash([3, 3])
    this.canvasCtx.strokeStyle = 'white'
    this.canvasCtx.lineDashOffset = -offset
    this.canvasCtx.stroke(path)

    this.marchTimeoutId = setTimeout(() => this.march(path, offset), 20)
  }

  pause() {
    this.setState({ paused: true })
    this.pauseTimeoutId = setTimeout(() => this.resume(), PAUSE_DURATION)
  }

  resume() {
    this.setState({ paused: false })
    window.clearTimeout(this.marchTimeoutId)
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
    const { loading } = this.state

    return loading ? <Loading theme={theme} nobackground /> : null
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

    const { width, height } = this.props
    return (
      <Fragment>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          hidden
          ref={el => {
            this.video = el
          }}
          width={width}
          height={height}
        />
        <canvas
          ref={el => {
            this.canvas = el
          }}
          width={width}
          height={height}
        />
        {paused ? <div className={styles.paused} /> : null}
      </Fragment>
    )
  }
}
