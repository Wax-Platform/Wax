/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/prop-types */
import React from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'
// import { InfoCircleOutlined } from '@ant-design/icons'
import Modal from '../common/Modal'
// import logoVertical from '../../../static/logoVertical.png'
// import cokoLogo from '../../../static/cokoLogo.png'

// const InfoCircleOutlinedStyled = styled(InfoCircleOutlined)`
//   font-size: 30px;
//   padding-right: 10px;
// `

const StyledModal = styled(Modal)`
  font-family: ${th('fontBrand')};
  p {
    font-size: ${th('fontSizeBaseSmall')};
  }

  .ant-modal-content {
    border-radius: 10px;
  }

  .ant-modal-header {
    border-radius: 10px 10px 0px 0px;
  }
`

// const CenteredLogo = styled.div`
//   height: 142px;
//   /*background-image: ${`url(${logoVertical})`};*/
//   background-position: center center;
//   background-repeat: no-repeat;
//   background-size: 520px 142px;
//   margin-bottom: 10px;
// `

// const CenteredCokoLogo = styled.div`
//   height: 168px;
//   /*background-image: ${`url(${cokoLogo})`};*/
//   background-position: center center;
//   background-repeat: no-repeat;
//   background-size: 300px 168px;
//   margin-bottom: 10px;
// `

const ConfirmDelete = ({
  deleteResourceRow,
  setDeleteResourceRow,
  deleteResourceFn,
}) => {
  const parts = window.location.href.split('/')
  const currentIdentifier = parts[parts.length - 1]

  const handleCancel = () => {
    setDeleteResourceRow(null)
  }

  return (
    <>
      {currentIdentifier !== deleteResourceRow?.bookComponentId ? (
        <StyledModal
          // bodyStyle={{ fontSize: th('fontSizeBaseSmall') }}
          closable
          onOk={() => {
            deleteResourceFn({ variables: { id: deleteResourceRow.id } })
            setDeleteResourceRow(null)
          }}
          // footer={null}
          maskClosable
          onCancel={handleCancel}
          open={!!deleteResourceRow}
          title="Delete Resource"
          width="420px"
        >
          Please Confirm
        </StyledModal>
      ) : (
        <StyledModal
          bodyStyle={{ fontSize: th('fontSizeBaseSmall') }}
          closable
          footer={null}
          maskClosable
          onCancel={handleCancel}
          open={!!deleteResourceRow}
          title="Delete Resource"
          width="420px"
        >
          Current file is active and cannot be deleted.
        </StyledModal>
      )}
    </>
  )
}

ConfirmDelete.propTypes = {}

ConfirmDelete.defaultProps = {}

export default ConfirmDelete
