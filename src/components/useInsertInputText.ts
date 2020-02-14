import { useState, useCallback } from 'react'
// ______________________________________________________
//
export function useInsertInputText() {
  const [inputText, setInputText] = useState('')
  const handleChangeInputText = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(event.currentTarget.value)
    },
    []
  )
  return {
    inputText,
    handleChangeInputText
  }
}
