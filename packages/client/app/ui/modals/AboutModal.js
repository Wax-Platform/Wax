import React, { useState } from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'
import { InfoCircleOutlined } from '@ant-design/icons'
import Modal from '../common/Modal'
import logoVertical from '../../../static/logoVertical.png'
import cokoLogo from '../../../static/cokoLogo.png'

const InfoCircleOutlinedStyled = styled(InfoCircleOutlined)`
  font-size: 30px;
  padding-right: 10px;
`

const StyledModal = styled(Modal)`
  font-family: ${th('fontBrand')};

  p {
    font-size: ${th('fontSizeBaseSmall')};
  }

  .ant-modal-content {
    border-radius: 10px;
  }

  .ant-modal-header {
    border-radius: 10px 10px 0 0;
  }
`

const CenteredLogo = styled.div`
  background-image: ${`url(${logoVertical})`};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 520px 142px;
  height: 142px;
  margin-bottom: 10px;
`

const CenteredCokoLogo = styled.div`
  background-image: ${`url(${cokoLogo})`};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 300px 168px;
  height: 168px;
  margin-bottom: 10px;
`

const AboutModal = () => {
  const [open, setOpen] = useState(false)

  const showModal = () => {
    setOpen(true)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <>
      <InfoCircleOutlinedStyled onClick={showModal} />
      <StyledModal
        bodyStyle={{ fontSize: th('fontSizeBaseSmall') }}
        closable
        footer={null}
        maskClosable
        onCancel={handleCancel}
        open={open}
        title="About Wax"
        width="720px"
      >
        <CenteredLogo />
        <p>
          <a
            href="https://gitlab.coko.foundation/wax/wax"
            rel="noreferrer"
            target="_blank"
          >
            Wax
          </a>{' '}
          is a project of{' '}
          <a href="https://coko.foundation/" rel="noreferrer" target="_blank">
            Coko
          </a>
          .
        </p>
        <p>
          Coko develops publishing platforms. If you would like to contribute to
          Wax, or <br />
          want us to build you a platform then drop us a line: <br />
          <a
            href="mailto:adam@coko.foundation"
            rel="noreferrer"
            target="_blank"
          >
            adam@coko.foundation
          </a>
          <br />
          <br />
        </p>
        <p>
          All Wax code is open source. Built with:
          <br />
          <a
            href="https://gitlab.coko.foundation/cokoapps/server"
            rel="noreferrer"
            target="_blank"
          >
            CokoServer
          </a>
          <br />
          <a href="https://waxjs.net/" rel="noreferrer" target="_blank">
            Wax
          </a>{' '}
          <br />
          <a href="https://docs.yjs.dev/" rel="noreferrer" target="_blank">
            YJS
          </a>
        </p>
        <p>Wax is currently in beta.</p>
        <CenteredCokoLogo />
      </StyledModal>
    </>
  )
}

AboutModal.propTypes = {}

AboutModal.defaultProps = {}

export default AboutModal
