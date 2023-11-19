import { json, jsonParseLinter } from '@codemirror/lang-json'
import { githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import { ReactElement, useEffect, useState } from 'react'
import { Message } from 'src/components/CustomTransactionMessage/BigMsg'
import styled from 'styled-components'

import { linter } from '@codemirror/lint'

const Wrap = styled.div`
  display: flex;
  gap: 24px;
  > div {
    max-width: 50%;
    width: 100%;
  }
  .cm-editor {
    border-radius: 8px;
    overflow: hidden;
  }
  .error > .cm-editor {
    outline: #d5625e 1px solid;
  }
  .error-msg {
    color: #d5625e;
    font-size: 12px;
    line-height: 16px;
  }
  .preview-msg {
    max-height: 54vh;
    overflow: auto;
  }
`

function MessageGenerator({ setMessage, setIsError }): ReactElement {
  const [rawMsg, setRawMsg] = useState('')
  const [parsedMsg, setParsedMsg] = useState<any[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  const onMsgChange = (msg) => {
    try {
      setErrorMsg('')
      setMessage([])
      setParsedMsg([])
      setRawMsg(msg)

      if (!msg) {
        setRawMsg('')
        setIsError(true)
        return
      }
      setIsError(false)
      const parsedMessage = JSON.parse(msg)
      if (typeof parsedMessage !== 'object' || !Array.isArray(parsedMessage)) {
        throw new Error('Input data is not an array')
      }
      parsedMessage.forEach((msg, index) => {
        if (!msg || !msg.typeUrl || !msg.value) throw new Error(`Msg #${index + 1} is invalid msg`)
      })
      setParsedMsg(parsedMessage)
      setMessage(parsedMessage)
    } catch (error) {
      setErrorMsg(error.message)
    }
  }

  const beutifyJson = () => {
    try {
      if (!errorMsg) {
        const parsedMessage = JSON.parse(rawMsg)
        const prettyJson = JSON.stringify(parsedMessage, undefined, 4)
        setRawMsg(prettyJson)
      }
    } catch (error) {}
  }

  useEffect(() => {
    if (errorMsg) {
      setIsError(true)
    }
  }, [errorMsg])

  return (
    <Wrap>
      <div>
        <p>Message</p>
        <CodeMirror
          className={errorMsg ? 'error' : ''}
          theme={githubDark}
          extensions={[json(), linter(jsonParseLinter())]}
          value={rawMsg}
          height="54vh"
          onChange={(value, viewUpdate) => onMsgChange(value)}
          onBlur={() => beutifyJson()}
          placeholder={`[
  {
    "typeUrl": "...",
    "value": {
      ...
    }
  },
  ...
]`}
        />
        <p className="error-msg">{errorMsg}</p>
      </div>
      <div className="preview">
        <p>Transaction Preview</p>
        <div className="preview-msg">
          {parsedMsg.map((msg, index) => {
            return <Message msgData={msg} key={index} index={index} />
          })}
        </div>
      </div>
    </Wrap>
  )
}

export default MessageGenerator
