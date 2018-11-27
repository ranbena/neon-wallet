// @flow
import React from 'react'
import { filter } from 'lodash-es'
import poll from '../util/poll'

const POLL_FREQUENCY = 1000

type State = {
  avail: boolean
}

type Props = {}

// $FlowFixMe
export default function withCameraAvailability(Component) {
  class CameraAvailability extends React.Component<Props, State> {
    config = { frequency: POLL_FREQUENCY }

    state = {
      avail: false
    }

    componentDidMount() {
      this.awaitAvailable()
    }

    componentDidUpdate(_: Props, prevState: State) {
      if (prevState.avail) {
        this.awaitNotAvailable()
      } else {
        this.awaitAvailable()
      }
    }

    // wait till camera is available
    awaitAvailable = async () => {
      await poll(this.isCameraAvailable, this.config)
      this.setState({ avail: true })
    }

    // wait till camera is no longer available
    awaitNotAvailable = async () => {
      await poll(this.noCameraAvailable, this.config)
      this.setState({ avail: false })
    }

    // check if any camera devices are available
    isCameraAvailable = async (): Promise<*> => {
      const cameras = await this.getCameras()
      return cameras.length > 0 ? Promise.resolve() : Promise.reject()
    }

    // check if no camera devices are available
    noCameraAvailable = async (): Promise<*> => {
      const cameras = await this.getCameras()
      return cameras.length === 0 ? Promise.resolve() : Promise.reject()
    }

    // get available cameras
    getCameras = async (): Promise<Array<MediaDeviceInfoType>> => {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return filter(devices, { kind: 'videoinput' })
    }

    render() {
      return <Component cameraAvailable={this.state.avail} {...this.props} />
    }
  }

  return CameraAvailability
}
