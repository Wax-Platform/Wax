/* stylelint-disable string-quotes */
/* stylelint-disable declaration-no-important */
import React, { useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { debounce } from 'lodash'
import { CleanButton } from '../_styleds/common'
import Each from '../component-ai-assistant/utils/Each'
import { safeCall } from '../component-ai-assistant/utils'
import { useBool } from '../../hooks/dataTypeHooks'
import { useModalContext } from '../../hooks/modalContext'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

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
  /* backdrop-filter: blur(4px); */
  display: ${p => (p.visible ? 'flex' : 'none')};
  height: fit-content;
  justify-content: center;
  position: absolute;
  width: fit-content;
  z-index: 999999999;
`

const ModalForm = styled.form`
  align-items: center;
  animation: ${p => p.shouldAnimate && showAnimation} 0.3s;
  background-color: var(--color-trois-lightest-2);
  border: 1px solid var(--color-trois-alpha);
  border-radius: 1rem 1rem 0.5rem 0.5rem;
  box-shadow: inset 0 0 6px #0001, 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 70%;
  padding: 0;
  width: 25dvw;

  h3 {
    display: flex;
    margin: 0;
  }
`

const ModalTitle = styled.p`
  align-items: center;
  color: var(--color-trois-opaque-2);
  display: flex;
  font-size: 20px;
  gap: 8px;

  line-height: 1;
  margin: 0;
  opacity: 0.8;
  padding: 0 4px;
  text-align: left;
  width: 100%;

  /* &::before {
    background-color: var(--color-trois-opaque-2);
    border-radius: 50%;
    content: '';
    display: flex;
    height: 8px;
    opacity: 0.5;
    width: 8px;
  } */
`

const Menu = styled.ul`
  --item-height: ${ITEM_HEIGHT}px;
  --svg-fill: var(--color-trois-opaque-2);
  align-items: center;
  /* background-color: var(--color-trois-opaque-3); */
  /* border-radius: 0.5rem; */
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  justify-content: flex-start;
  list-style: none;
  margin: 0 0 auto;
  padding: 12px 24px 24px;
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
  align-items: center;
  background-color: #fff;
  border: 1px solid #fff0;
  border-radius: 0.4rem;
  box-shadow: 0 0 4px #0001, inset 0 0 2px #0001;
  display: flex;
  gap: 4px;
  height: fit-content;
  overflow-y: auto;
  padding: 8px 12px;
  transition: all 0.2s;
  width: 98%;

  &:focus-within {
    border-color: var(--color-trois-alpha);
    outline: none;
  }

  [data-field-id] {
    width: 100%;
  }

  input {
    align-self: flex-end;
    background: none;
    border: none;
    color: #555;
    font-size: 14px;
    transition: all 0.2s;
    z-index: 1;

    &:focus {
      border-color: transparent;
      outline: none;
    }

    &::placeholder {
      color: #fff0;
      font-size: 12px;
      opacity: 0.8;
    }
  }
`
const SubmitButton = styled(CleanButton)`
  align-items: center;
  aspect-ratio: 1;
  background-color: var(${p => p.colorVar});
  border-radius: 50%;
  box-shadow: 0 0 6px var(--color-trois-opaque-2), inset 2px 2px 6px #fff6;
  color: #fff;
  filter: brightness(1);
  font-size: 16px;
  gap: 12px;
  padding: 4px 8px;
  transform: scale(0.8);
  transition: all 0.2s;
  width: fit-content;

  .anticon {
    font-size: 14px;
  }

  svg {
    fill: #fff;
    transition: all 0.2s;
  }

  &:hover {
    filter: brightness(1.1);

    svg {
      fill: var(--color-trois-lightest);
    }
  }
`

const Label = styled.span`
  border-right: 1px solid var(--color-trois-alpha);
  color: var(--color-trois-opaque-2);
  font-size: 10px;
  line-height: 1.5;
  padding: 0 8px 0 0;
  text-transform: uppercase;
  width: fit-content;
  z-index: 3;
`

const Header = styled.div`
  align-items: flex-end;
  display: flex;
  gap: 2px;
  justify-content: space-between;
  padding: 8px 8px 8px 28px;
  width: 100%;
`

const fieldRender = option => {
  const { label, component, ...props } = option

  return label === '-' ? (
    <hr></hr>
  ) : (
    <MenuItem {...props} style={!label ? { padding: '0' } : {}}>
      {label && <Label>{label}</Label>}
      {component}
    </MenuItem>
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
      formRef.current.querySelector('[data-field-id]')?.focus()
    }
  }, [items, formRef])

  const shouldNotDisplay = !transitioning.state && !visible.state && !show

  const shouldAnimate = visible.state && transitioning.state
  const modalFields = items

  const handleSubmit = e => {
    e.preventDefault()
    const fieldsInDom = document.querySelectorAll('[data-field-id]')
    const buildEntries = ({ dataset: { fieldId }, value }) => [fieldId, value]

    const fieldsEntries = [...fieldsInDom].map(buildEntries)
    const fields = Object.fromEntries(fieldsEntries)
    const passed = safeCall(onSubmit, console.log)(fields)
    passed !== false && modalState.reset()
  }

  if (shouldNotDisplay) return null

  return (
    <Overlay visible={modalState.state?.show}>
      <ModalForm
        ref={formRef}
        onSubmit={handleSubmit}
        onKeyDown={e => e.key === 'Escape' && modalState.reset()}
        shouldAnimate={shouldAnimate}
      >
        <Header>
          <ModalTitle>
            {modalState.state?.title && modalState.state.title}
          </ModalTitle>
          <SubmitButton onClick={modalState.reset} colorVar="--color-red">
            <CloseOutlined />
          </SubmitButton>
          {itemsCount && onSubmit && (
            <SubmitButton onClick={handleSubmit} colorVar="--color-green">
              <CheckOutlined />
            </SubmitButton>
          )}
        </Header>
        <Menu>
          <Each of={modalFields} as={fieldRender} if={itemsCount} />
        </Menu>
      </ModalForm>
    </Overlay>
  )
}

export default ContextModal
