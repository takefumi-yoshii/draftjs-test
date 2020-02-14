import React from 'react'
import { Editor } from 'draft-js'
import { blockRendererFnFactory } from './strategies'
import { useEditorState } from './useEditorState'
import { useInsertInputText } from './useInsertInputText'
import { useHandleClickInsert } from './useHandleClickInsert'
import { decoratorFactory } from './strategies'
import { InlineRefTag } from './InlineRefTag'
// ______________________________________________________
//
const Component: React.FC = () => {
  const decorator = React.useMemo(() => decoratorFactory(InlineRefTag), [])
  const blockRendererFn = React.useMemo(
    () => blockRendererFnFactory(InlineRefTag),
    []
  )
  const {
    editorState,
    setEditorState,
    handleChangeEditor,
    handleKeyCommand
  } = useEditorState({
    decorator
  })
  const { inputText, handleChangeInputText } = useInsertInputText()
  const { handleClickInsert } = useHandleClickInsert({
    inputText,
    editorState,
    setEditorState,
    decorator
  })
  return (
    <div>
      <div className="form">
        <input type="text" value={inputText} onChange={handleChangeInputText} />
        <button onClick={handleClickInsert}>insert</button>
      </div>
      <div className="editor">
        <Editor
          editorState={editorState}
          blockRendererFn={blockRendererFn}
          onChange={handleChangeEditor}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
    </div>
  )
}
// ______________________________________________________
//
export default Component
