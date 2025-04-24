import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  FileExcelOutlined,
  FileMarkdownOutlined,
  FilePdfOutlined,
  FileWordOutlined,
} from '@ant-design/icons'
import { grid, th } from '@coko/client'
import { keys } from 'lodash'
import { useTranslation } from 'react-i18next'
import FilesList from './FilesList'
// import ActionsSidebar from './ActionsSidebar'
// import KBHeader from './KBHeader'
import { GlobalContext } from '../../helpers/hooks/GlobalContext'

const xlFileExtensions = ['xls', 'xlsb', 'xlsm', 'xlsx', 'xlt', 'xltm', 'xltx']

const fileIcons = {
  md: { icon: FileMarkdownOutlined, color: '#625286' },
  docx: { icon: FileWordOutlined, color: '#3054a0' },
  pdf: { icon: FilePdfOutlined, color: '#b82727' },
  xmls: { icon: FileExcelOutlined, color: '#429d50' },
  xls: { icon: FileExcelOutlined, color: '#429d50' },
}

const Wrapper = styled.div`
  display: block;
  height: calc(100% - 50px);
  position: relative;

  * {
    ::-webkit-scrollbar {
      height: 5px;
      width: 5px;
    }

    ::-webkit-scrollbar-thumb {
      background: ${th('colorSecondary')};
      border-radius: 5px;
      width: 5px;
    }

    ::-webkit-scrollbar-track {
      background: #fff0;
      padding: 5px;
    }
  }

  .ant-spin-container,
  .ant-spin-nested-loading {
    height: 100%;
  }
`

const FileList = styled(FilesList)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`

const Header = styled.div`
  align-items: center;
  border-block-end: 1px solid ${th('colorBorder')};
  display: flex;
  justify-content: space-between;
  padding: ${grid(2)} ${grid(7)};
  white-space: nowrap;

  h2 {
    color: ${th('colorTextLight')};
    font-size: 28px;
    margin: 0;
  }
`

const KnowledgeBase = props => {
  const { bookId, docs, createDocument, deleteDocument } = props

  const { t } = useTranslation(null, { keyPrefix: 'pages.knowledgeBase' })

  const {
    filesToUpload,
    setFilesToUpload,
    filesBeingUploaded,
    setFilesBeingUploaded,
  } = useContext(GlobalContext)

  const [selectedFiles, setSelectedFiles] = useState([])

  const scrollToTopOfFilesList = () => {
    document
      .querySelector('.ant-upload-wrapper') // [1] as long as the other Upload exists on header
      .scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  const handleFileChange = ({ file }) => {
    setFilesToUpload(prevFiles => [...prevFiles, file])
    scrollToTopOfFilesList()
  }

  const handleUpload = async file => {
    setFilesBeingUploaded(current => [...current, file.uid])
    await createDocument({ variables: { file, bookId } })
    setFilesToUpload(currentFiles =>
      currentFiles.filter(f => f.uid !== file.uid),
    )
    setFilesBeingUploaded(currentFiles =>
      currentFiles.filter(f => f !== file.uid),
    )
  }

  const bulkActions = {
    async upload() {
      setFilesBeingUploaded(filesToUpload.map(f => f.uid))

      try {
        // eslint-disable-next-line no-restricted-syntax
        for await (const file of filesToUpload) {
          await handleUpload(file)
        }
      } catch (error) {
        console.error(error)
      }
    },
    async delete() {
      if (selectedFiles.length < 1) return

      try {
        await Promise.all(
          selectedFiles.map(async id => {
            deleteDocument(id)
          }),
        )
      } catch (error) {
        console.error(error)
      } finally {
        setSelectedFiles([])
      }
    },
    select() {
      selectedFiles.length === docs.length
        ? setSelectedFiles([])
        : setSelectedFiles(docs.map(({ id }) => id))
    },
  }

  const filesToAccept = keys(fileIcons)
    .map(k => `.${k}`)
    .concat(xlFileExtensions.map(l => `.${l}`))
    .join(',')

  const noFilesNotUploads =
    filesBeingUploaded.length < 1 && docs.length < 1 && filesToUpload.length < 1

  return (
    <Wrapper>
      <Header>
        <h2>{t('title')}</h2>
      </Header>
      <FileList
        bulkActions={bulkActions}
        deleteDocument={deleteDocument}
        docs={docs}
        fileIcons={fileIcons}
        filesToAccept={filesToAccept}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        noFilesNotUploads={noFilesNotUploads}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        xlFileExtensions={xlFileExtensions}
      />
    </Wrapper>
  )
}

KnowledgeBase.propTypes = {
  bookId: PropTypes.string.isRequired,
  docs: PropTypes.instanceOf(Array),
  createDocument: PropTypes.func,
  deleteDocument: PropTypes.func,
}

KnowledgeBase.defaultProps = {
  docs: [],
  createDocument: null,
  deleteDocument: null,
}

export default KnowledgeBase
