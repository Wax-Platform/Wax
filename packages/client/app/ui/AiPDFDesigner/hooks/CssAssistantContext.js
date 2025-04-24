/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-param-reassign */
import React, { createContext, useMemo, useRef, useState } from 'react'
import { callOn, htmlTagNames, onEntries, safeCall } from '../utils'

export const CssAssistantContext = createContext()

// eslint-disable-next-line react/prop-types
export const CssAssistantProvider = ({ children }) => {
  const context = useRef([])
  const validSelectors = useRef(null)
  const styleSheetRef = useRef(null)
  const history = useRef({ active: true, index: 0 })

  const [selectedCtx, setSelectedCtx] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)

  const [htmlSrc, setHtmlSrc] = useState(null)
  const [css, setCss] = useState(null)
  const [passedContent, setPassedContent] = useState('')

  const [feedback, setFeedback] = useState('')

  const promptRef = useRef(null)
  const [userPrompt, setUserPrompt] = useState('')

  const createStyleSheet = onCreate => {
    if (!document.getElementById('css-assistant-scoped-styles')) {
      const styleTag = document.createElement('style')
      styleTag.id = 'css-assistant-scoped-styles'
      safeCall(onCreate)(styleTag)
      return styleTag
    }

    return document.getElementById('css-assistant-scoped-styles')
  }

  const makeSelector = (node, parent) => {
    const tagName = node.tagName.toLowerCase()

    const parentSelector = parent || ''

    const classNames =
      [...node.classList].length > 0 ? `.${[...node.classList].join('.')}` : ''

    const selector = `${
      parentSelector
        ? `${parentSelector} > ${tagName}${classNames}`
        : `${tagName}${node.id ? `#${node.id}` : ''}${classNames}`
    }`.trim()

    return { selector, tagName, classNames }
  }

  const makeSelectors = (node, parentSelector) => {
    const selectors = []
    const allChilds = node?.children ? [...node.children] : []

    const { selector } = makeSelector(node, parentSelector)

    selectors.push(selector)

    if (allChilds.length > 0) {
      allChilds.forEach(
        child =>
          (child.title = `${
            htmlTagNames[child.tagName.toLowerCase()]
          } : <${child.tagName.toLowerCase()}>`),
      )

      const allChildsSelectors = allChilds.flatMap(
        child => child && makeSelectors(child, selector),
      )

      allChildsSelectors && selectors.push(...allChildsSelectors)
    }

    return [...new Set(selectors)]
  }

  const getValidSelectors = (node, parentSelector = '') => {
    const selectors = makeSelectors(node, parentSelector)
    validSelectors.current = selectors
  }

  const newCtx = (node, parent, rules = {}, addSelector = true) => {
    const { selector, tagName } = makeSelector(node, parent)

    return {
      selector: addSelector ? selector : '',
      node,
      tagName,
      rules,
      history: [],
    }
  }

  const addToCtx = ctx => {
    if (ctx.selector && getCtxBy('selector', ctx.selector)) return false
    context.current = [...context.current, ctx]
    return ctx
  }

  const getCtxBy = (by, prop, all) => {
    const method = all ? 'filter' : 'find'

    const ctxProps = {
      node: node => context.current[method](ctx => ctx.node === node),
      selector: selector =>
        context.current[method](ctx => ctx.selector === selector),
      tagName: tag => context.current[method](ctx => ctx.tagName === tag),
      default: node => context.current[method](ctx => ctx.node === node),
    }

    return callOn(by, ctxProps, [prop])
  }

  const addRules = (ctx, inputRules = {}) => {
    if (!ctx) return null
    const rules = { ...ctx.rules }
    onEntries(inputRules, (rule, value) => (rules[rule] = value))
    ctx.rules = rules

    return rules
  }

  const dom = useMemo(() => {
    return {
      promptRef,
      styleSheetRef,
      createStyleSheet,
    }
  }, [styleSheetRef, promptRef])

  const ctx = useMemo(() => {
    return {
      context,
      history,
      validSelectors,
      selectedNode,
      selectedCtx,
      setSelectedCtx,
      setSelectedNode,
    }
  }, [context, history, selectedCtx, selectedNode, validSelectors])

  const chatGpt = useMemo(() => {
    return {
      feedback,
      userPrompt,
      setFeedback,
      setUserPrompt,
    }
  }, [feedback, userPrompt])

  const htmlAndCss = useMemo(() => {
    return {
      css,
      htmlSrc,
      setCss,
      setHtmlSrc,
    }
  }, [css, htmlSrc])

  return (
    <CssAssistantContext.Provider
      value={{
        ...htmlAndCss,
        ...dom,
        ...ctx,
        ...chatGpt,
        getValidSelectors,
        makeSelector,
        addToCtx,
        getCtxBy,
        newCtx,
        addRules,
        passedContent,
        setPassedContent,
      }}
    >
      {children}
    </CssAssistantContext.Provider>
  )
}

export const ModalContext = createContext()
