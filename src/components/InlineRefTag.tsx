import * as React from 'react'
import { ContentState } from 'draft-js'
// ______________________________________________________
//
interface Props {
  contentState: ContentState
  decoratedText: string
  dir: null
  start: number
  end: number
  blockKey: string
  entityKey: null
  offsetKey: string
}
// ______________________________________________________
//
export const InlineRefTag: React.FC<Props> = props =>
  React.useMemo(() => {
    // trim "{ref:}" from props.decoratedText
    const refText = props.decoratedText.slice(5, -1)
    return (
      <span
        className="inline-reftag"
        contentEditable={true}
        data-offset-key={props.offsetKey}
        data-content={refText}
      />
    )
  }, [props.decoratedText])
