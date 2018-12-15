// @flow
import React from 'react'

import classNames from 'classnames'
import themes from '../../themes'
import Loader from '../../components/Loader'
import styles from './Loading.scss'

export const ANIMATION_DURATION = 900 // one animation round in ms

type Props = {
  className?: string,
  theme: ThemeType
}

export default function Loading(props: Props) {
  const { theme, className: additional } = props
  const className = classNames(styles.loading, additional)

  return (
    <div style={themes[theme]} className={className}>
      <Loader />
    </div>
  )
}
