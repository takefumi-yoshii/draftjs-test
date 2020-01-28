import * as React from 'react'

const EditableSpanComponent: React.FC = ({ children }) => {
  return (
    <span className="inline-space" contentEditable>
      {children}
    </span>
  )
}

export default EditableSpanComponent
