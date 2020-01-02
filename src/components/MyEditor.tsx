import React, { useState, useCallback } from 'react'
import _ from 'lodash'
import { Editor, EditorState, CompositeDecorator } from 'draft-js'

import InlineRefTag from './InlineRefTag'

const findWithRegex = (regex: any, contentBlock: any, callback: any) => {
  const text = contentBlock.getText()
  let matchArr
  while ((matchArr = regex.exec(text)) !== null) {
    const start = matchArr.index
    callback(start, start + _.size(matchArr[0]))
  }
}

const refTagStrategy = (contentBlock: any, callback: any) => {
  const REFTAG_REGEX = /{ref:(\d+?)}/g
  findWithRegex(REFTAG_REGEX, contentBlock, callback)
}

const decorator = new CompositeDecorator([
  {
    strategy: refTagStrategy,
    component: InlineRefTag
  }
])

const MyEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty(decorator))

  const handleChange = useCallback(
    es => {
      setEditorState(es)
    },
    [editorState]
  )

  return (
    <div className="editor">
      <Editor editorState={editorState} onChange={handleChange} />
    </div>
  )
}

export default MyEditor
