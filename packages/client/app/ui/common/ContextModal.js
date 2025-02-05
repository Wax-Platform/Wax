/* stylelint-disable declaration-no-important */
import React, { useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { debounce } from 'lodash'
import { CleanButton, FlexRow } from '../_styleds/common'
import Each from '../component-ai-assistant/utils/Each'
import { safeCall } from '../component-ai-assistant/utils'
import { useBool } from '../../hooks/dataTypeHooks'
import { useDocumentContext } from '../dashboard/hooks/DocumentContext'
import { useModalContext } from '../../hooks/modalContext'
import { CloseOutlined } from '@ant-design/icons'

const showAnimation = keyframes`
  from {
    opacity: 0;
    transform: scaleY(0);
  }

  to {
    opacity: 1;
    transform: scaleY(1);
  }
`
const ITEM_HEIGHT = 24

const Overlay = styled.div`
  align-items: center;
  backdrop-filter: blur(4px);
  display: ${p => (p.visible ? 'flex' : 'none')};
  height: 100dvh;
  justify-content: center;
  position: absolute;
  width: 100dvw;
  z-index: 999999999;
`

const ModalForm = styled.form`
  align-items: center;
  animation: ${p => p.shouldAnimate && showAnimation} 0.3s;
  background-color: var(--color-trois-lightest);
  border: 1px solid var(--color-trois-alpha);
  border-radius: 1rem;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 50%;
  padding: 8px;
  width: 35%;

  h3 {
    display: flex;
    margin: 0;
  }
`

const ModalHeader = styled(FlexRow)`
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 8px;
  width: 100%;

  * {
    color: var(--color-trois-opaque-2);
    margin: 0;
  }
`

const Menu = styled.ul`
  --item-height: ${ITEM_HEIGHT}px;
  --svg-fill: var(--color-trois-opaque-2);
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  justify-content: flex-start;
  list-style: none;
  margin: 0 0 auto;
  padding: 4px 20px;
  width: 100%;

  * {
    user-select: none;
  }

  hr {
    margin: 2px 0;
    padding: 4px;

    &::after {
      background-color: var(--color-trois-alpha);
    }
  }
`

const MenuItem = styled.li`
  align-items: flex-start;
  background-color: none;
  display: flex;
  flex-direction: column;
  height: fit-content;
  overflow-y: auto;
  width: 98%;

  [data-field-id] {
    width: 100%;
  }

  input {
    align-self: flex-end;
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-trois-alpha);
    font-size: 12px;
    padding-top: 4px;
    transition: all 0.2s;
    z-index: 1;

    &:focus {
      border-bottom-color: var(--color-trois-opaque-2);
      outline: none;
    }

    &::placeholder {
      color: var(--color-trois-opaque);
      font-size: 12px;
      opacity: 0.8;
    }
  }
`
const SubmitButton = styled(CleanButton)`
  background-color: var(--color-trois-opaque);
  border-radius: 8px;
  box-shadow: 0 2px 8px #0001;
  color: var(--color-trois-lightest);
  font-size: 16px;
  margin: 4px;
  min-width: 100px;
  padding: 8px;
  width: fit-content;
`

const Label = styled.span`
  color: var(--color-trois-opaque-2);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  width: fit-content;
  z-index: 3;
`

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  width: 100%;
`

const optionRender = option => {
  const { label, component, ...props } = option

  return label === '-' ? (
    <hr></hr>
  ) : (
    <FlexRow as={MenuItem} {...props}>
      {label && <Label>{label}:</Label>}
      {component}
    </FlexRow>
  )
}

const ContextModal = ({ className }) => {
  const { modalState } = useModalContext()
  const { show, items = [], x = 0, y = 0, onSubmit } = modalState.state || {}
  const visible = useBool({ start: show })
  const transitioning = useBool({ start: false })
  const { length: itemsCount } = items || []
  const formRef = useRef(null)

  const handleHide = debounce(transitioning.off, 300)

  useEffect(() => {
    transitioning.on()
    show ? visible.on() : visible.off()
    handleHide()
  }, [show])

  useEffect(() => {
    if (formRef?.current) {
      formRef.current.querySelector('input').focus()
    }
  }, [formRef?.current])

  const shouldNotDisplay = !transitioning.state && !visible.state && !show
  if (shouldNotDisplay) return null

  const shouldAnimate = visible.state && transitioning.state
  const options = items

  const handleSubmit = e => {
    e.preventDefault()
    const fieldsInDom = document.querySelectorAll('[data-field-id]')
    const buildEntries = ({ dataset: { fieldId }, value }) => [fieldId, value]

    const fieldsEntries = [...fieldsInDom].map(buildEntries)
    const fields = Object.fromEntries(fieldsEntries)
    const passed = safeCall(onSubmit, console.log)(fields)
    passed !== false && modalState.reset()
  }
  return (
    <Overlay visible={modalState.state?.show}>
      <ModalForm
        ref={formRef}
        onSubmit={handleSubmit}
        shouldAnimate={shouldAnimate}
      >
        <ModalHeader>
          {modalState.state?.title && <h3>{modalState.state.title}</h3>}
          <CloseOutlined
            style={{ fontSize: '14px' }}
            onClick={modalState.reset}
          />
        </ModalHeader>
        <Menu>
          <Each of={options} as={optionRender} if={itemsCount} />
        </Menu>
        {itemsCount && onSubmit && (
          <ModalFooter>
            <SubmitButton onClick={handleSubmit}>ok</SubmitButton>
          </ModalFooter>
        )}
      </ModalForm>
    </Overlay>
  )
}

export default ContextModal
