/* eslint-disable no-underscore-dangle */
import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
  createRef,
} from 'react'
import { isEmpty } from 'lodash'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import {
  DocumentHelpers,
  WaxContext,
  ApplicationContext,
  Icon,
  useOnClickOutside,
} from 'wax-prosemirror-core'

const Wrapper = styled.div`
  display: flex;
  opacity: ${props => (props.disabled ? '0.4' : '1')};
`

const ButtonWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

const DropDownButton = styled.button`
  background: #fff0;
  border: none;
  color: #000;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  width: 130px;

  span {
    position: relative;
    top: 2px;
  }
`

const DropDownMenu = styled.div`
  background-color: var(--color-trois-lightest);
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  box-shadow: 0 0.2rem 0.4rem rgb(0 0 0 / 10%);
  color: var(--color-trois-opaque);
  display: flex;
  flex-direction: column;
  margin: 32px auto auto;
  max-height: 180px;
  overflow-y: auto;
  position: absolute;
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  width: 160px;
  z-index: 2;

  option {
    color: var(--toolbar-icons-color);
    cursor: pointer;
    padding: 8px 10px;
  }

  option:focus,
  option:hover {
    background: var(--color-trois-alpha);
  }

  option:disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }
`

const StyledIcon = styled(Icon)`
  height: 18px;
  margin-left: auto;
  pointer-events: none;
  width: 18px;
`

const BlockDropDownComponent = ({ view, tools }) => {
  const { t, i18n } = useTranslation()

  const translatedLabel = (translation, defaultLabel) => {
    return !isEmpty(i18n) && i18n.exists(translation)
      ? t(translation)
      : defaultLabel
  }

  const dropDownOptions = [
    {
      label: translatedLabel(`Wax.BlockLevel.Title (H1)`, 'Title'),
      value: '0',
      item: tools[0],
    },
    {
      label: translatedLabel(`Wax.BlockLevel.Heading 2`, 'Heading 2'),
      value: '5',
      item: tools[5],
    },
    {
      label: translatedLabel(`Wax.BlockLevel.Heading 3`, 'Heading 3'),
      value: '6',
      item: tools[6],
    },
    {
      label: translatedLabel(`Wax.BlockLevel.Paragraph`, 'Paragraph'),
      value: '8',
      item: tools[8],
    },
    // {
    //   label: translatedLabel(`Wax.BlockLevel.Block Quote`, 'Block Quote'),
    //   value: '13',
    //   item: tools[13],
    // },
  ]

  const context = useContext(WaxContext)
  const { app } = useContext(ApplicationContext)
  const {
    activeView,
    activeViewId,
    pmViews: { main },
  } = context
  const [label, setLabel] = useState(null)
  const { state } = view

  /* Chapter Title */
  const titleNode = DocumentHelpers.findChildrenByType(
    state.doc,
    state.config.schema.nodes.title,
    true,
  )
  const titleConfig = app.config.get('config.TitleService')

  let chapterTitle = ''
  if (titleNode[0]) chapterTitle = titleNode[0].node.textContent

  useEffect(() => {
    if (titleConfig) {
      if (titleNode[0]) {
        titleConfig.updateTitle(titleNode[0].node.textContent)
      } else {
        titleConfig.updateTitle('')
      }
    }
  }, [chapterTitle])

  const itemRefs = useRef([])
  const wrapperRef = useRef()
  const [isOpen, setIsOpen] = useState(false)
  const isEditable = main.props.editable(editable => {
    return editable
  })

  const isDisabled = !isEditable

  useOnClickOutside(wrapperRef, () => setIsOpen(false))

  useEffect(() => {
    if (isDisabled) setIsOpen(false)
  }, [isDisabled])

  useEffect(() => {
    setLabel(translatedLabel('Wax.BlockLevel.Block Level', 'Block Tools'))
    let delayedSetLabel = () => true
    dropDownOptions.forEach(option => {
      if (option.item.active(main.state, activeViewId)) {
        delayedSetLabel = setTimeout(() => {
          setLabel(
            translatedLabel(
              `Wax.BlockLevel.${option.item.label}`,
              option.item.label,
            ),
          )
        })
      }
    })
    return () => clearTimeout(delayedSetLabel)
  }, [
    main.state.selection.$from.parent.type.name,
    t('Wax.BlockLevel.Paragraph'),
  ])

  const openCloseMenu = e => {
    setIsOpen(!isOpen)
  }

  const onKeyDown = (e, index) => {
    e.preventDefault()
    // arrow down
    if (e.keyCode === 40) {
      if (index === itemRefs.current.length - 1) {
        itemRefs.current[0].current.focus()
      } else {
        itemRefs.current[index + 1].current.focus()
      }
    }

    // arrow up
    if (e.keyCode === 38) {
      if (index === 0) {
        itemRefs.current[itemRefs.current.length - 1].current.focus()
      } else {
        itemRefs.current[index - 1].current.focus()
      }
    }

    // enter
    if (e.keyCode === 13) {
      itemRefs.current[index].current.click()
    }

    // ESC
    if (e.keyCode === 27) {
      setIsOpen(false)
    }
  }

  const MultipleDropDown = useMemo(
    () => (
      <Wrapper disabled={isDisabled} ref={wrapperRef}>
        <ButtonWrapper>
          <DropDownButton
            aria-controls="block-level-options"
            aria-expanded={isOpen}
            aria-haspopup
            disabled={isDisabled}
            onKeyDown={e => {
              if (e.keyCode === 40) {
                itemRefs.current[0].current.focus()
              }
              if (e.keyCode === 27) {
                setIsOpen(false)
              }
              if (e.keyCode === 13 || e.keyCode === 32) {
                setIsOpen(true)
              }
            }}
            onMouseDown={openCloseMenu}
            type="button"
          >
            <span>{label}</span>
            <StyledIcon name="expand" />
          </DropDownButton>
        </ButtonWrapper>
        <DropDownMenu
          aria-label="Choose a block level action"
          id="block-level-options"
          isOpen={isOpen}
          role="menu"
        >
          {dropDownOptions.map((option, index) => {
            itemRefs.current[index] = itemRefs.current[index] || createRef()
            return (
              <option
                disabled={
                  !tools[option.value].select(
                    main.state,
                    activeViewId,
                    activeView,
                  )
                }
                key={option.value}
                onMouseDown={() => {
                  tools[option.value].run(main.state, main.dispatch)

                  openCloseMenu()
                }}
                onKeyDown={e => onKeyDown(e, index)}
                ref={itemRefs.current[index]}
                role="menuitem"
                tabIndex="-1"
              >
                {option.label}
              </option>
            )
          })}
        </DropDownMenu>
      </Wrapper>
    ),
    [isDisabled, isOpen, label, t('Wax.BlockLevel.Paragraph')],
  )

  return MultipleDropDown
}

export default BlockDropDownComponent
