/* eslint-disable react/jsx-props-no-spreading */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { debounce } from 'lodash'

import { Form as AntForm } from 'antd'
import { grid, th } from '@coko/client'

import UIRibbon from './Ribbon'

const FormWrapper = styled.div`
  .ant-form-item-explain-error {
    color: ${th('colorError')};
  }
`

const Ribbon = styled(UIRibbon)`
  margin: ${grid(2)} ${grid(4)};
`

const FormItem = props => {
  /**
   * Disable prop types as these props will be checked in the `AntForm.Item`
   * component. Enable again if you introduce custom props.
   */

  /* eslint-disable-next-line react/prop-types */
  const { children, onBlur, validateTrigger, ...rest } = props
  const [lostFocusOnce, setLostFocusOnce] = useState(false)

  /**
   * Default behaviour is that errors only appear once you have touched the
   * input and moved away from it. Once touched, validations are run on every
   * change. Submitting a form will touch all fields. Setting validateTrigger
   * in the props will override the default behaviour. All we're doing here is
   * changing the default.
   */
  const useDefaultTrigger = !validateTrigger
  const defaultTrigger = !lostFocusOnce ? 'onBlur' : 'onChange'
  const trigger = useDefaultTrigger ? defaultTrigger : validateTrigger

  const handleBlur = () => {
    if (useDefaultTrigger && !lostFocusOnce) setLostFocusOnce(true)
    onBlur && onBlur()
  }

  return (
    <AntForm.Item onBlur={handleBlur} validateTrigger={trigger} {...rest}>
      {children}
    </AntForm.Item>
  )
}

// Disable the prop types that are the same as the underlying component
const Form = props => {
  const {
    autoSave,
    autoSaveDebounceDelay,
    children,
    feedbackComponent: FeedbackComponent,
    // eslint-disable-next-line react/prop-types
    form: propsForm,
    onAutoSave,
    // eslint-disable-next-line react/prop-types
    onValuesChange,
    onFinishFailed,
    ribbonMessage,
    ribbonPosition,
    submissionStatus,
    scrollErrorIntoView,
    ...rest
  } = props

  const showRibbon = !!submissionStatus && !!ribbonMessage
  const [internalForm] = AntForm.useForm()
  const form = propsForm || internalForm

  // eslint-disable-next-line react/prop-types
  const runAutoSave = debounce(() => onAutoSave(form.getFieldsValue()), 500)

  const handleValuesChange = (changedValues, allValues) => {
    if (autoSave && onAutoSave) runAutoSave()
    onValuesChange && onValuesChange()
  }

  const FeedbackElement = showRibbon && (
    <FeedbackComponent
      data-testid="feedback-element"
      role="status"
      status={submissionStatus}
    >
      {ribbonMessage}
    </FeedbackComponent>
  )

  // const FeedbackElement = (
  //   <FeedbackComponent hide={!showRibbon} status={submissionStatus}>
  //     {ribbonMessage}
  //   </FeedbackComponent>
  // )

  // if form validation fails, scroll to first error field (if applicable) and focus
  const focusErrorField = errorFields => {
    let firstErrorField = document.getElementById(errorFields[0].name.join('_'))

    // handle case when input is a radio group
    if (firstErrorField.matches('div[role="radiogroup"]')) {
      // should focus it's first radio button, since radiogroup is not focusable
      firstErrorField = firstErrorField.querySelector('input[type="radio"]')
    }

    // create intersection observer to to check when scroll target is in view
    const observer = new IntersectionObserver(entries => {
      const [entry] = entries

      if (entry.isIntersecting) {
        setTimeout(() => {
          // focus element after it becomes visible
          entry.target.focus()
          observer.unobserve(entry.target)
        }, 100)
      }
    })

    observer.observe(firstErrorField)

    // scroll to first error field
    form.scrollToField(errorFields[0].name, {
      // specify custom scrolling behavior
      behavior: actions => {
        if (actions.length === 0) {
          // no element to scroll to, field is visible
          firstErrorField.focus()
        } else {
          // check motion preferences; avoid scrolling if users prefers reduced motion
          const motionQuery = window.matchMedia('(prefers-reduced-motion)')
          // start observing for when field becomes visible
          observer.observe(firstErrorField)

          const action = actions.find(el => el.top > 0)

          const { el, top, left } = action
          el.scrollTo({
            top: top - 50,
            left,
            behavior: motionQuery.matches ? 'auto' : 'smooth',
          })
        }
      },
    })
  }

  const handleFinishFailed = data => {
    if (scrollErrorIntoView) {
      const { errorFields } = data
      focusErrorField(errorFields)
    }

    onFinishFailed(data)
  }

  return (
    <FormWrapper>
      {ribbonPosition === 'top' && FeedbackElement}

      <AntForm
        data-testid="form-content"
        form={form}
        onFinishFailed={handleFinishFailed}
        onValuesChange={handleValuesChange}
        {...rest}
      >
        {children}
      </AntForm>

      {ribbonPosition === 'bottom' && FeedbackElement}
    </FormWrapper>
  )
}

Form.propTypes = {
  autoSave: PropTypes.bool,
  autoSaveDebounceDelay: PropTypes.number,
  feedbackComponent: PropTypes.elementType,
  onAutoSave: PropTypes.func,
  onFinishFailed: PropTypes.func,
  ribbonMessage: PropTypes.string,
  ribbonPosition: PropTypes.oneOf(['top', 'bottom']),
  submissionStatus: PropTypes.oneOf(['success', 'error', 'danger']),
  scrollErrorIntoView: PropTypes.bool,
}

Form.defaultProps = {
  autoSave: false,
  autoSaveDebounceDelay: 500,
  feedbackComponent: Ribbon,
  onAutoSave: null,
  onFinishFailed: () => {},
  ribbonMessage: null,
  ribbonPosition: 'top',
  submissionStatus: null,
  scrollErrorIntoView: true,
}

// const Form = {}
// Object.setPrototypeOf(Form, AntForm)

/* Replicate exports from https://github.com/ant-design/ant-design/blob/master/components/form/index.tsx#L24-L35 */
Form.render = Form
Form.Item = FormItem
Form.List = AntForm.List
Form.ErrorList = AntForm.ErrorList
Form.useForm = AntForm.useForm
Form.Provider = AntForm.FormProvider

// Form.create = () => {
//   devWarning(
//     false,
//     'Form',
//     'antd v4 removed `Form.create`. Please remove or use `@ant-design/compatible` instead.',
//   )
// }

export default Form
