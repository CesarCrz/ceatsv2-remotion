import React from 'react'
import { Composition } from 'remotion'
import { CeatsVideo } from './CeatsVideo'
import { TOTAL_FRAMES } from './constants'

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="CeatsDemo"
        component={CeatsVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  )
}
