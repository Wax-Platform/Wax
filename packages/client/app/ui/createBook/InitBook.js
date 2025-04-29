/* stylelint-disable string-quotes */
/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-no-important */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Card } from 'antd'
import { useTranslation } from 'react-i18next'
import { grid, th } from '@coko/client'
import { Button } from '../common'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${th('colorBackground')};
  display: flex;
  height: 100%;
  overflow: auto;

  > div {
    margin-block-start: -100px;
  }

  // 580 + 2*grid(4)
  @media (max-width: 612px) {
    align-items: start;
    padding-block: ${grid(16)};

    > div {
      margin-block-start: 0;
    }
  }
`

const Center = styled.div`
  --max-width: 100ch;
  --min-width: 0;
  --s1: ${grid(4)};
  /* ↓ Remove padding from the width calculation */
  box-sizing: content-box;
  /* ↓ Only affect horizontal margins */
  margin-inline: auto;
  /* ↓ The maximum width is the maximum measure */
  max-width: var(--max-width, 70ch);
  min-width: var(--min-width, 0);
  /* ↓ Apply the minimum horizontal space */
  padding-left: var(--s1);
  padding-right: var(--s1);
`

const Switcher = styled.div`
  --gutter: clamp(48px, 1.051rem + 5.0955vi, 80px);
  display: flex;
  flex-wrap: wrap;
  /* ↓ The default value is the first point on the modular scale */
  gap: var(--gutter, var(--s1));
  justify-content: space-around;
  /* ↓ The width at which the layout “breaks” */
  --threshold: 581px;

  > * {
    /* ↓ Switch the layout at the --threshold */
    flex-basis: calc((var(--threshold) - 100%) * 999);
    /* ↓ Allow children to grow */
    flex-grow: 1;
  }

  > :nth-last-child(n + 5),
  > :nth-last-child(n + 5) ~ * {
    /* ↓ Switch to a vertical configuration if
        there are more than 4 child elements */
    flex-basis: 100%;
  }
`

const Stack = styled.div`
  --w: 3; /* width */
  --h: 4; /* height */
  /* aspect-ratio: attr(width) / attr(height); */
  aspect-ratio: var(--w) / var(--h);
  /* ↓ The flex context */
  display: flex !important;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  padding: ${grid(5)};

  > * {
    /* ↓ Any extant vertical margins are removed */
    margin-block: 0;
  }

  > * + * {
    /* ↓ Top margin is only applied to successive elements */
    margin-block-start: var(--space, 2.5rem);
  }
`

const StyledCard = styled(Card)`
  font-size: 16px;
  max-width: 35ch;

  .ant-card-cover {
    height: 100%;
    position: relative;
  }

  .ant-card-body {
    display: none;
  }
`

const StyledButton = styled(Button)`
  margin-block-start: auto;
  position: unset;

  &::before {
    content: '';
    inset: 0;
    position: absolute;
  }
`

const InitBook = props => {
  const { onCreateBook } = props
  const { t } = useTranslation(null, { keyPrefix: 'pages.newBook.sections' })

  const [loadingCreateBook, setLoadingCreateBook] = useState(false)

  const handleCreateBook = () => {
    setLoadingCreateBook(true)
    onCreateBook().finally(() => {
      setLoadingCreateBook(false)
    })
  }

  return (
    <Wrapper>
      <Center>
        <Switcher>
          <StyledCard
            cover={
              <Stack>
                <h2>{t('write.heading')}</h2>
                <p>{t('write.description')}.</p>
                <StyledButton
                  data-test="createBook-startWriting-button"
                  disabled={loadingCreateBook}
                  onClick={handleCreateBook}
                  size="large"
                  type="primary"
                >
                  {t('write.action')}
                </StyledButton>
              </Stack>
            }
            hoverable
            size="small"
          />
        </Switcher>
      </Center>
    </Wrapper>
  )
}

InitBook.propTypes = {
  onCreateBook: PropTypes.func,
  // onImportBook: PropTypes.func,
}

InitBook.defaultProps = {
  onCreateBook: null,
  // onImportBook: null,
}

export default InitBook
