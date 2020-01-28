/* eslint-disable no-control-regex */
import React, { useState, useCallback, useEffect } from 'react'
import _ from 'lodash'
import {
  Editor,
  EditorState,
  CompositeDecorator,
  convertFromRaw,
  ContentBlock,
  convertToRaw,
  RawDraftContentBlock,
  ContentState
} from 'draft-js'

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
    strategy: refTagStrategy,
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
      text: '{ref:111}',
      type: 'unstyled',
      entityRanges: [{ offset: 0, length: 9, key: 'first' }]
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

const rawText = 'apeowjfapwioefjpawoiefja\n\naoweijfoawe{ref:111}{ref:222}apewiofjapweif'

const convertTextToRaw = (content: any) => {
  // const blocks = convertFromRaw(rawContent as any)
  // const newEditorState = EditorState.createWithContent(blocks, decorator)
  // const newEditorState = EditorState.createEmpty(decorator)
  // const arrText = content.replace(/{ref:(\d+)}/g, '@@@@{ref:$1}@@@@').split('@@')
  const arrText = content.split('\n')
  const newBlocks: any = []
  const entityMaps: any = []
  const regex = /{ref:\d+}/g

  _.each(arrText, (text, index) => {
    let result
    const entityRanges = []

    console.log('text.match(/^{ref:d+}$/)', text.match(/{ref:\d+}/))
    if (text.match(/{ref:\d+}$/)) {
      while ((result = regex.exec(text)) !== null) {
        entityRanges.push({
          offset: result.index,
          length: result[0].length,
          key: result.index
        })
      }

      newBlocks[index] = {
        text: text,
        type: 'refTag',
        entityRanges: [{ offset: 0, length: text.length, key: index }]
        // entityRanges: entityRanges
      }

      // _.each(entityRanges, range => {
      //   entityMaps[range.key] = {
      //     mutability: 'IMMUTABLE',
      //     type: 'TOKEN'
      //   }
      // })
    } else {
      newBlocks[index] = {
        text: text,
        type: 'unstyled'
      }
    }
  })

  const newRawContent = { blocks: newBlocks, entityMap: entityMaps }
  console.log('newRawContent', newRawContent)

  return convertFromRaw(newRawContent)
}

const MyEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty(decorator))
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    const newEditorState = EditorState.createWithContent(convertTextToRaw(rawText), decorator)
    // const newEditorState = EditorState.createWithContent(convertTextToRaw(rawText))

    // const newEditorState = EditorState.createWithContent(ContentState.createFromText(rawText), decorator)
    // console.log('blocks', newEditorState.getCurrentContent().toJS())
    setEditorState(newEditorState)
  }, [])

  const handleChange = useCallback(
    es => {
      setEditorState(es)
    },
    [editorState]
  )

  const handleClick = useCallback(() => {
    const contentState = editorState.getCurrentContent()
    const selectionState = editorState.getSelection()
    const rawContent = convertToRaw(contentState)

    const contentBlocks: any = []
    const entityMaps: any = []
    const regex = /^{ref:\d+}$/

    const newContent: any = { ...rawContent }
    // _.each(indexes, index => {})

    // newContent.blocks.push({
    //   text: '',
    //   type: 'unstyled'
    // })
    newContent.blocks.push({
      text: '{ref:100}',
      type: 'refTag'
    })
    // newContent.blocks.push({
    //   text: '',
    //   type: 'unstyled'
    // })

    _.each(newContent.blocks, (block, index) => {
      if (block.text.match(regex)) {
        const newBlock = { ...block }

        newBlock.entityRanges = [{ offset: 0, length: block.text.length, key: index }]
        contentBlocks[index] = newBlock
        entityMaps[index] = {
          mutability: 'IMMUTABLE',
          type: 'TOKEN'
        }
      } else {
        contentBlocks[index] = block
      }
    })
    const newRawContent = { blocks: contentBlocks, entityMap: entityMaps }
    // const currentContent = JSON.stringify(newRawContent)
    const newEditorState = EditorState.createWithContent(convertFromRaw(newRawContent), decorator)

    // console.log('contentBlocks', contentBlocks)
    // console.log('entityMaps', entityMaps)

    // console.log('selectionState', selectionState.toJS())
    // console.log('rawContent', rawContent)
    // console.log('currentContent', currentContent)
    setEditorState(EditorState.forceSelection(newEditorState, selectionState))
  }, [editorState])

  const myBlockRenderer = (contentBlock: ContentBlock) => {
    const type = contentBlock.getType()
    if (type === 'refTag') {
      return {
        component: InlineRefTag,
        editable: false
      }
    }
  }

  return (
    <div>
      <button onClick={handleClick} style={{ display: 'block', margin: '0 auto 20px' }}>
        クリック
      </button>
      <div className="editor">
        <Editor editorState={editorState} blockRendererFn={myBlockRenderer} onChange={handleChange} />
      </div>
    </div>
  )
}

export default MyEditor
