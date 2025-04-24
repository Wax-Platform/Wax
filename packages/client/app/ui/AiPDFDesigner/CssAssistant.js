import React, { useEffect, useContext } from 'react'
import styled from 'styled-components'
import { debounce, takeRight } from 'lodash'
import { rotate360 } from '@coko/client'
import PropTypes from 'prop-types'
import { useLazyQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { USE_CHATGPT } from '../../graphql'
import {
  autoResize,
  callOn,
  setImagesDefaultStyles,
  setInlineStyle,
  systemGuidelinesV2,
} from './utils'
import SendIcon from './SendButton'
import { CssAssistantContext } from './hooks/CssAssistantContext'

const StyledForm = styled.form`
  --color: #008238;
  --color-border: #0004;
  --font-size: 14px;
  align-items: center;
  background-color: #fffe;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  display: flex;
  font-size: var(--font-size);
  gap: 8px;
  height: fit-content;
  justify-content: center;
  overflow: auto;
  padding: 0.4rem 0.8rem;
  position: relative;
  transition: all 0.5s;
  width: 500px;

  textarea {
    --height: ${p => p.height || `24px`};
    background: none;
    border: none;
    caret-color: var(--color);
    font-size: inherit;
    height: var(--height);
    max-height: 100px;
    outline: none;
    overflow-y: auto;
    resize: none;
    width: 100%;
  }
`

const StyledSpinner = styled.div`
  display: flex;
  height: fit-content;
  width: 24px;

  &::after {
    animation: ${rotate360} 1s linear infinite;
    border: 2px solid #008238;
    border-color: #008238 transparent;
    border-radius: 50%;
    /* stylelint-disable-next-line string-quotes */
    content: ' ';
    display: block;
    height: 18px;
    margin: 1px;
    width: 18px;
  }
`

const SendButton = styled.button`
  aspect-ratio: 1 /1;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  width: 24px;

  > svg {
    fill: #008238;
    transform: scale(1.35);
  }
`

const CssAssistant = ({
  enabled,
  className,
  stylesFromSource,
  updatePreview,
  ...rest
}) => {
  // #region HOOKS ---------------------------------------------------------------------
  const {
    styleSheetRef,
    setCss,
    htmlSrc,
    selectedCtx,
    setSelectedCtx,
    setSelectedNode,
    // selectedNode,
    setFeedback,
    history,
    userPrompt,
    setUserPrompt,
    promptRef,
    createStyleSheet,
    validSelectors,
    addRules,
    newCtx,
    getCtxBy,
    addToCtx,
    getValidSelectors,
  } = useContext(CssAssistantContext)

  const { t } = useTranslation(null, { keyPrefix: 'pages.aiBookDesigner.chat' })

  const responses = {
    error1: t('notifications.error.message'),
  }

  const [callOpenAi, { loading }] = useLazyQuery(USE_CHATGPT, {
    onCompleted: ({ openAi }) => {
      const { message = '' } = JSON.parse(openAi)

      if (message.content.startsWith('{')) {
        try {
          const response = JSON.parse(message.content)
          const { css, rules, feedback, textContent = '' } = response
          const ctxIsHtmlSrc = selectedCtx.node === htmlSrc

          if (rules && !ctxIsHtmlSrc) {
            addRules(selectedCtx, rules)
            setInlineStyle(selectedCtx.node, rules)
          } else if (css) {
            styleSheetRef.current.textContent = css
            setCss(styleSheetRef.current.textContent)
          }

          textContent && (selectedCtx.node.innerHTML = textContent)
          feedback && setFeedback(feedback)
          feedback &&
            selectedCtx.history.push({ role: 'assistant', content: feedback })
          updatePreview()
        } catch (err) {
          setFeedback(responses.error1)
        }
      } else {
        setFeedback(responses.error1)
        selectedCtx.history.push({
          role: 'assistant',
          content: responses.error1,
        })
      }

      setUserPrompt('')
    },
  })

  useEffect(() => {
    if (htmlSrc) {
      const tempScope = htmlSrc
      !tempScope.id && (tempScope.id = 'assistant-ctx')
      const allChilds = [...htmlSrc.children]

      styleSheetRef.current = createStyleSheet(styleTag =>
        htmlSrc.parentNode.insertBefore(styleTag, htmlSrc),
      )
      stylesFromSource && (styleSheetRef.current.textContent = stylesFromSource)

      addToCtx(newCtx(htmlSrc))
      setSelectedCtx(getCtxBy('node', htmlSrc))
      setSelectedNode(htmlSrc)
      setCss(styleSheetRef.current.textContent)

      allChilds.forEach(child => {
        child.addEventListener('click', handleSelection)
        setImagesDefaultStyles(child)
      })
      getValidSelectors(htmlSrc)

      htmlSrc.parentNode.parentNode.addEventListener('click', handleSelection)
    }
  }, [htmlSrc])

  useEffect(() => {
    return () => {
      if (htmlSrc) {
        ;[...htmlSrc.children].forEach(child =>
          child.removeEventListener('click', handleSelection),
        )
        htmlSrc.parentNode.parentNode.removeEventListener(
          'click',
          handleSelection,
        )
      }
    }
  }, [])

  useEffect(() => {
    debouncedResize()
  }, [userPrompt])

  const handleChange = ({ target }) => {
    if (loading) return
    setUserPrompt(target.value)
    debouncedResize()
  }

  const handleSelection = e => {
    e.preventDefault()
    e.stopPropagation()

    if (htmlSrc.contains(e.target)) {
      const ctx =
        getCtxBy('node', e.target) ||
        addToCtx(newCtx(e.target, null, {}, false))

      setSelectedCtx(ctx)
      setSelectedNode(e.target)
    } else {
      setSelectedCtx(getCtxBy('node', htmlSrc))
      setSelectedNode(htmlSrc)
    }

    promptRef.current.focus()
  }

  const handleSend = async e => {
    if (loading) return
    e.preventDefault()
    userPrompt && setFeedback(t('notifications.loading.message'))
    userPrompt
      ? callOpenAi({
          variables: {
            input: { text: [userPrompt] },
            history: takeRight(selectedCtx.history, 14) || [],
            // TODO: update the system message and pass it as object
            system: {
              text: systemGuidelinesV2({
                ctx: selectedCtx || getCtxBy('node', htmlSrc),
                sheet: styleSheetRef?.current?.textContent,
                selectors: validSelectors?.current?.join(', '),
                providedText: '',
              }),
            },
          },
        })
      : setFeedback(t('prompt.errors.noValue'))
    selectedCtx.history.push({ role: 'user', content: userPrompt })
  }

  const handleKeydown = async e => {
    callOn(e.key, {
      Enter: () => !e.shiftKey && handleSend(e),
      ArrowDown: () => {
        const userHistory = selectedCtx.history.filter(v => v.role === 'user')
        if (userHistory.length < 1) return
        history.current.index > 0
          ? (history.current.index -= 1)
          : (history.current.index = userHistory.length - 1)

        history.current.active &&
          setUserPrompt(userHistory[history.current.index].content)
        history.current.active = true
      },
      ArrowUp: () => {},
      default: () => history.current.active && (history.current.active = false),
    })
  }

  // #endregion HANDLERS

  const debouncedResize = debounce(() => {
    autoResize(promptRef.current)
  }, 300)

  return (
    <StyledForm $enabled={enabled} className={className}>
      <textarea
        disabled={!enabled}
        onChange={handleChange}
        onKeyDown={handleKeydown}
        ref={promptRef}
        value={userPrompt}
        {...rest}
      />
      {loading ? (
        <StyledSpinner />
      ) : (
        <SendButton onClick={handleSend}>
          <SendIcon size="18" />
        </SendButton>
      )}
    </StyledForm>
  )
}

CssAssistant.propTypes = {
  enabled: PropTypes.bool,
  className: PropTypes.string,
  stylesFromSource: PropTypes.string,
  updatePreview: PropTypes.func.isRequired,
}

CssAssistant.defaultProps = {
  enabled: true,
  className: '',
  stylesFromSource: '',
}

export default CssAssistant
