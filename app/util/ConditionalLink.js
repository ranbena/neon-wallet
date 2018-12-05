// @flow
import React, { Fragment } from 'react'
import Tooltip from '../components/Tooltip'

type Props = {
  href: ?string,
  tooltip?: string,
  children: React$Node
}

export function ConditionalLink(props: Props): React$Element<*> {
  const { href, tooltip } = props
  let { children } = props

  if (href) {
    if (tooltip) {
      children = <Tooltip title={tooltip}>{children}</Tooltip>
    }
    return <a {...props}>{children}</a>
  }
  return <Fragment>{children}</Fragment>
}
