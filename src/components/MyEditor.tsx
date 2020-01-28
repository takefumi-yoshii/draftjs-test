/* eslint-disable no-control-regex */
import React, { useState, useCallback, useEffect } from 'react'
import _ from 'lodash'
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
  convertFromHTML,
  ContentBlock,
  convertFromRaw,
  RawDraftContentState,
  convertToRaw
} from 'draft-js'

import InlineRefTag from './InlineRefTag'
import EditableSpan from './EditableSpan'

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

const spaceStrategy = (ContentBlock: any, callback: any) => {
  const SPACE_REGEX = /\x08(.*?)\x08/g
  findWithRegex(SPACE_REGEX, ContentBlock, callback)
}

const getEntityStrategy = (mutability: string) => {
  return (contentBlock: any, callback: any, contentState: any) => {
    contentBlock.findEntityRanges((character: any) => {
      const entityKey = character.getEntity()
      if (entityKey === null) {
        return false
      }

      console.log('mutability', mutability)
      console.log('character', character.toJS())
      console.log('entityKey', entityKey)

      return contentState.getEntity(entityKey).getMutability() === mutability
    }, callback)
  }
}

const decorator = new CompositeDecorator([
  {
    strategy: getEntityStrategy('IMMUTABLE'),
    component: InlineRefTag
  }
])

const rawContent = {
  blocks: [
    {
      text: 'aaaaaa',
      type: 'unstyled'
    },
    {
      text: '',
      type: 'unstyled'
    },
    {
      text: 'a{ref:111}e',
      type: 'unstyled',
      entityRanges: [{ offset: 1, length: 9, key: 'first' }]
    },
    {
      text: '',
      type: 'unstyled'
    },
    {
      text: 'bbbbb',
      type: 'unstyled'
    }
  ],
  entityMap: {
    first: {
      type: 'TOKEN',
      mutability: 'IMMUTABLE'
    }
  }
}

const MyEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty(decorator))
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    const blocks = convertFromRaw(rawContent as any)
    const newEditorState = EditorState.createWithContent(blocks, decorator)
    // const newEditorState = EditorState.createEmpty(decorator)
    setEditorState(newEditorState)
  }, [])

  const handleChange = useCallback(
    es => {
      setEditorState(es)

      // const contentState = es.getCurrentContent()
      // const selectionState = es.getSelection()
      // const startOffset = selectionState.getStartOffset()
      // const endOffset = selectionState.getEndOffset()
      // const startKey = selectionState.getStartKey()
      // const endKey = selectionState.getEndKey()
      // const blockMap = contentState.getBlocksAsArray()
      // const plainText = contentState.getPlainText()
      // const blocks: any = []
      // let index = 0
      // const regex = /{ref:\d+}/g
      // _.map(plainText.split(/\r\n|\r|\n/), text => {
      //   const matched = text.match(/{ref:\d+}/)
      //   if (matched) {
      //     const texts = text.replace(/{ref:(\d+)}/g, '@@{ref:$1}@@').split('@@')
      //     _.each(texts, t => {
      //       console.log('text', t)

      //       if (t.match(/^{ref:(\d+)$}/)) {
      //         blocks[index] = {
      //           text: t,
      //           type: 'unstyled',
      //           entityRanges: [
      //             {
      //               offset: 0,
      //               length: t.length,
      //               key: 'first'
      //             }
      //           ]
      //         }
      //       } else {
      //         blocks[index] = {
      //           text: t,
      //           type: 'unstyled'
      //         }
      //       }
      //       index++
      //     })
      //   } else {
      //     blocks[index] = {
      //       text: text,
      //       type: 'unstyled'
      //     }
      //     index++
      //   }
      // })

      // const blockList = {
      //   blocks: blocks,
      //   entityMap: {
      //     first: {
      //       type: 'TOKEN',
      //       mutability: 'IMMUTABLE'
      //     }
      //   }
      // }

      // const newEditorState = EditorState.createWithContent(convertFromRaw(blockList as any), decorator)
      // console.log('es.getSelection()', es.getSelection().toJS())
      // setEditorState(newEditorState)
      // console.log('blockList', blockList)

      // console.log('blockList', blockList)
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
