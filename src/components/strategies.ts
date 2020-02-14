import { ContentBlock, CompositeDecorator } from 'draft-js'
// ______________________________________________________
//
export const GUARD = '\r'
export const REFTAG_REGEX = /{ref:([^{}]+?)}/g
// ______________________________________________________
//
const findWithRegex = (
  regex: RegExp,
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void
): void => {
  const text = contentBlock.getText()
  let matchArr
  while ((matchArr = regex.exec(text)) !== null) {
    const start = matchArr.index
    callback(start, start + matchArr[0].length)
  }
}
const refTagStrategy = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void
): void => {
  findWithRegex(REFTAG_REGEX, contentBlock, callback)
}
// ______________________________________________________
//
export const blockRendererFnFactory = (component: React.ReactNode) => (
  contentBlock: ContentBlock
) => {
  const type = contentBlock.getType()
  if (type === 'refTag') {
    return {
      component,
      editable: false
    }
  }
}
// ______________________________________________________
//
export const decoratorFactory = (component: Function) =>
  new CompositeDecorator([
    {
      component,
      strategy: refTagStrategy
    }
  ])
