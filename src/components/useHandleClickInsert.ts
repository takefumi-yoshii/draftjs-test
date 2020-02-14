import { useCallback } from 'react'
import {
  convertFromRaw,
  convertToRaw,
  ContentState,
  EditorState,
  RawDraftContentBlock,
  RawDraftContentState,
  SelectionState,
  CompositeDecorator
} from 'draft-js'
import { GUARD } from './strategies'
// ______________________________________________________
//
const insertRefStringToRawDraftContentBlock = (
  refString: string,
  anchorOffset: number
) => (block: RawDraftContentBlock) => {
  const start = block.text.slice(0, anchorOffset)
  const end = block.text.slice(anchorOffset, -1)
  block.text = `${start}{ref:${refString}}${GUARD}${end}`
  return block
}
function getRawDraftContentStateWithInsertRef(
  refString: string,
  contentState: ContentState,
  selectionState: SelectionState
): [RawDraftContentState, number] {
  const rawContent = convertToRaw(contentState)
  const anchorKey = selectionState.getAnchorKey()
  const anchorOffset = selectionState.getAnchorOffset()
  const end = refString.length + anchorOffset + 6 // "6" is "{ref:}" length
  rawContent.blocks
    .filter(block => block.key === anchorKey)
    .map(insertRefStringToRawDraftContentBlock(refString, anchorOffset))
  return [rawContent, end]
}
// ______________________________________________________
//
export const useHandleClickInsert = (props: {
  inputText: string
  editorState: EditorState
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>
  decorator: CompositeDecorator
}) => ({
  handleClickInsert: useCallback(() => {
    const contentState = props.editorState.getCurrentContent()
    const selectionState = props.editorState.getSelection()
    const [rawContent, end] = getRawDraftContentStateWithInsertRef(
      props.inputText,
      contentState,
      selectionState
    )
    const newEditorState = EditorState.createWithContent(
      convertFromRaw(rawContent),
      props.decorator
    )
    props.setEditorState(
      EditorState.forceSelection(
        newEditorState,
        selectionState
          .set('focusOffset', end)
          .set('anchorOffset', end) as SelectionState
      )
    )
  }, [props.inputText, props.editorState])
})
