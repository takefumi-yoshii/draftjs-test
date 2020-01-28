import * as React from 'react'

interface Props {
  offsetKey: string
}

const InlineRefTagComponent: React.FC<Props> = ({ offsetKey }) => {
  console.log('offsetKey', offsetKey)
  return (
    <div className="inline-reftag" contentEditable={false} data-offset-key={offsetKey}>
      testtest
    </div>
  )
}

export default InlineRefTagComponent
