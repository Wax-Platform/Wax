import React from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'
import Modal from '../common/Modal'

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

const ConfirmDelete = ({
  deleteResourceRow,
  setDeleteResourceRow,
  deleteResourceFn,
}) => {
  const parts = window.location.href.split('/')
  const currentIdentifier = parts[parts.length - 1]
  const handleCancel = () => setDeleteResourceRow(null)

  return (
    <>
      {currentIdentifier !== deleteResourceRow?.identifier ? (
        <StyledModal
          bodyStyle={{ fontSize: th('fontSizeBaseSmall') }}
          closable
          onOk={() => {
            deleteResourceFn({ variables: { id: deleteResourceRow.id } })
            setDeleteResourceRow(null)
          }}
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
