import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'

const BookMetadataLocked = ({ open, closeModal }) => {
  return (
    <Modal
      cancelText="Close"
      centered
      destroyOnClose
      maskClosable={false}
      okButtonProps={{ style: { display: 'none' } }}
      onCancel={closeModal}
      open={open}
      title="Book Metadata"
      width={480}
    >
      Metadata cannot be edited while chapters are being processed
    </Modal>
  )
}

BookMetadataLocked.propTypes = {
  open: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
}

export default BookMetadataLocked
