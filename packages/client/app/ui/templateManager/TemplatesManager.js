import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
/* eslint-disable-next-line import/no-extraneous-dependencies */
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { ReloadOutlined } from '@ant-design/icons'
import { th } from '@coko/client'
import { Table, Button } from '../common'
import TemplateManagerHeader from './TemplateManagerHeader'
import TemplateDetails from './TemplateDetails'
import Modals from './Modals'

const AdminWrapper = styled.div`
  background-color: #e8e8e8;
  min-height: 100vh;
  padding-block: 1rem 3rem;
`

const Wrapper = styled.section`
  background-color: ${th('colorBackground')};
  margin-inline: auto;
  max-inline-size: 1100px;
  padding-block-end: 24px;
  padding-inline: 32px;
`

const ButtonWrapper = styled.div`
  display: flex;
  gap: 2ch;
`

const details = {
  expandedRowRender: record => <TemplateDetails record={record} />,
}

const TemplateMananger = props => {
  const {
    loading,
    templatesData,
    addTemplate,
    addingTemplate,
    disableTemplate,
    disableLoading,
    removeTemplate,
    enableTemplate,
    refreshTemplate,
    refreshingTemplate,
  } = props

  const { t } = useTranslation(null, { keyPrefix: 'pages.templateManager' })

  const [addNewModal, setAddNewModal] = useState(false)
  const [disableTemplateModal, setDisableTemplateModal] = useState(false)
  const [templateToDisable, setTemplateToDisable] = useState(null)
  const [deleteTemplateModal, setDeleteTemplateModal] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState(null)
  const [currentRefreshTemplate, setCurrentRefreshTemplate] = useState('')

  const parseTempaltes = data => {
    if (data) {
      const map = new Map()

      data.forEach(item => {
        const key = item.name
        const collection = map.get(key)

        if (!collection) {
          map.set(key, [item])
        } else {
          collection.push(item)
        }
      })

      return Array.from(map, ([name, templates], i) => ({
        key: i,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        enabled: templates[0].enabled,
        author: templates[0].author,
        lastUpdated: templates.reduce(
          (lastUpdated, template) =>
            template.lastUpdated > lastUpdated
              ? template.lastUpdated
              : lastUpdated,
          templates[0].lastUpdated,
        ),
        url: templates[0].url,
        canBeDeleted: templates[0].canBeDeleted,
        formats: templates,
        disable: () => {
          setTemplateToDisable({ name, url: templates[0].url })
          setDisableTemplateModal(true)
        },
        enable: () => {
          handleEnableTemplate(templates[0].url)
        },
        deleteTemplate: () => {
          setTemplateToDelete({ name, url: templates[0].url })
          setDeleteTemplateModal(true)
        },
      })).sort((a, b) => b.enabled - a.enabled)
    }

    return null
  }

  const columns = [
    {
      title: t('table.name'),
      dataIndex: 'name',
      key: 'name',
      render: (value, row) => {
        /* eslint-disable-next-line prefer-template */
        return `${value} ${row.enabled ? '' : ' ' + t('table.row.disabled')}`
      },
    },
    {
      title: t('table.lastUpdated'),
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: lastUpdated => moment(new Date(lastUpdated)).fromNow(),
    },
    {
      title: t('table.actions'),
      dataIndex: 'url',
      key: 'actions',
      render: url => {
        const refreshing = refreshingTemplate && currentRefreshTemplate === url
        return (
          <ButtonWrapper>
            <Button
              disabled={refreshingTemplate}
              loading={refreshing}
              onClick={() => handleRefreshTempalte(url)}
            >
              {!refreshing && <ReloadOutlined />}
              {t('actions.refresh')}
            </Button>
          </ButtonWrapper>
        )
      },
    },
  ]

  const handleEnableTemplate = url => {
    enableTemplate({
      variables: {
        url,
      },
    }).then(() => {})
  }

  const handleRefreshTempalte = url => {
    setCurrentRefreshTemplate(url)
    refreshTemplate({
      variables: {
        url,
      },
    }).then(() => {
      setCurrentRefreshTemplate('')
    })
  }

  const handleDisableTemplate = data => {
    if (templatesData.filter(temp => temp.enabled).length > 1) {
      return disableTemplate(data)
    }

    return Promise.reject(
      new Error(
        'There is only one enabled template left, therefore it cannot be disabled.',
      ),
    )
  }

  return (
    <AdminWrapper>
      <Wrapper>
        <TemplateManagerHeader
          openNewTemplateModal={() => setAddNewModal(true)}
        />
        <Table
          columns={columns}
          dataSource={parseTempaltes(templatesData)}
          expandable={details}
          loading={loading}
          pagination={false}
        />
        <Modals
          addingTemplate={addingTemplate}
          addNewModal={addNewModal}
          addTemplate={addTemplate}
          deleteTemplateModal={deleteTemplateModal}
          disableLoading={disableLoading}
          disableTemplate={handleDisableTemplate}
          disableTemplateModal={disableTemplateModal}
          removeTemplate={removeTemplate}
          setAddNewModal={setAddNewModal}
          setDeleteTemplateModal={setDeleteTemplateModal}
          setDisableTemplateModal={setDisableTemplateModal}
          setTemplateToDelete={setTemplateToDelete}
          setTemplateToDisable={setTemplateToDisable}
          templateToDelete={templateToDelete}
          templateToDisable={templateToDisable}
        />
      </Wrapper>
    </AdminWrapper>
  )
}

TemplateMananger.propTypes = {
  loading: PropTypes.bool,
  templatesData: PropTypes.arrayOf(PropTypes.shape({})),
  addTemplate: PropTypes.func,
  addingTemplate: PropTypes.bool,
  disableTemplate: PropTypes.func,
  disableLoading: PropTypes.bool,
  removeTemplate: PropTypes.func,
  enableTemplate: PropTypes.func,
  refreshTemplate: PropTypes.func,
  refreshingTemplate: PropTypes.bool,
}

TemplateMananger.defaultProps = {
  loading: false,
  templatesData: [],
  addTemplate: null,
  addingTemplate: false,
  disableTemplate: null,
  disableLoading: false,
  removeTemplate: null,
  enableTemplate: null,
  refreshTemplate: null,
  refreshingTemplate: false,
}

export default TemplateMananger
