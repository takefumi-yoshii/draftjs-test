import { useState, useCallback, useEffect } from 'react'
import {
  convertFromRaw,
  convertToRaw,
  EditorState,
  DraftEditorCommand,
  DraftHandleValue,
  CompositeDecorator
} from 'draft-js'
import { GUARD, REFTAG_REGEX } from './strategies'
// ______________________________________________________
//
const rawText =
  'あいうえお\n\nABCDEFG{ref:111}\r{ref:222}HIJKLMN\n{ref:222}\n{ref:222}\n{ref:aaa}{ref:あいうえお}'
// ______________________________________________________
//
const convertTextToRaw = (content: any) => {
  const arrText: string[] = content.split('\n')
  const newBlocks: any = []
  const entityMaps: any = []
  arrText.map((text, index) => {
    let result
    let _text = text + GUARD
    const entityRanges = []
    if (_text.match(/{ref:([^{}]+?)}$/)) {
      while ((result = REFTAG_REGEX.exec(_text)) !== null) {
        entityRanges.push({
          offset: result.index,
          length: result[0].length,
          key: result.index
        })
      }
      newBlocks[index] = {
        text: _text,
        type: 'refTag',
        entityRanges: [{ offset: 0, length: text.length, key: index }]
      }
    } else {
      newBlocks[index] = {
        text: _text,
        type: 'unstyled'
      }
    }
  })
  const newRawContent = { blocks: newBlocks, entityMap: entityMaps }
  return convertFromRaw(newRawContent)
}
// ______________________________________________________
//
export function useEditorState(props: { decorator: CompositeDecorator }) {
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty(props.decorator)
  )
  const handleChangeEditor = useCallback((es: EditorState) => {
    setEditorState(es)
  }, [])
  const handleKeyCommand = useCallback(
    (
      command: DraftEditorCommand,
      editorState: EditorState
    ): DraftHandleValue => {
      if (command === 'backspace' || command === 'split-block') {
        const contentState = editorState.getCurrentContent()
        const selectionState = editorState.getSelection()
        const anchorKey = selectionState.getAnchorKey()
        const anchorOffset = selectionState.getAnchorOffset()
        const rawContent = convertToRaw(contentState)
        const draftHandleValue = rawContent.blocks
          .filter(block => block.key === anchorKey)
          .map(block => {
            const before = block.text.slice(anchorOffset - 1, anchorOffset)
            const after = block.text.slice(anchorOffset, anchorOffset - 1)
            return before === GUARD || after === GUARD
              ? 'handled'
              : ('not-handled' as const)
          })[0]
        return draftHandleValue
      }
      return 'not-handled'
    },
    []
  )

  //
  useEffect(() => {
    const newEditorState = EditorState.createWithContent(
      convertTextToRaw(rawText),
      props.decorator
    )
    setEditorState(newEditorState)
  }, [])
  return {
    editorState,
    setEditorState,
    handleChangeEditor,
    handleKeyCommand
  }
}
