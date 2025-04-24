import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { isEmpty } from 'lodash'
import { th } from '@coko/client'
import { PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import mapValues from 'lodash/mapValues'
import { Form, Upload, Image } from 'antd'
import { Box, Center, Input, TextArea } from '../../common'
import CopyrightLicenseInput from './CopyrightLicenseInput'
import ISBNList from './ISBNList'

const FormSection = styled.div`
  border-top: 2px solid ${th('colorText')};
`

const BookMetadataForm = ({
  initialValues,
  onSubmitBookMetadata,
  canChangeMetadata,
  onUploadBookCover,
  className,
}) => {
  const [form] = Form.useForm()

  const { t } = useTranslation(null, {
    keyPrefix: 'pages.producer.bookMetadataTab',
  })

  const { coverUrl, ...rest } = initialValues

  const transformedInitialValues = mapValues(rest, (value, key) => {
    const dateFields = ['ncCopyrightYear', 'saCopyrightYear']
    return dateFields.includes(key) && dayjs(value).isValid()
      ? dayjs(value)
      : value
  })

  if (isEmpty(transformedInitialValues.isbns)) {
    transformedInitialValues.isbns = []
  }

  // useEffect(() => {
  //   if (!isEqual(initialFormValues, transformedInitialValues)) {
  //     form.setFieldsValue(transformedInitialValues)
  //     setInitialFormValues(transformedInitialValues)
  //   }
  // }, [initialValues])

  useEffect(() => {
    if (coverUrl) {
      setCover([
        {
          uid: '-1',
          name: 'cover',
          status: 'done',
          url: coverUrl,
        },
      ])
    }
  }, [coverUrl])

  const [cover, setCover] = useState(
    coverUrl
      ? [
          {
            uid: '-1',
            name: 'cover',
            status: 'done',
            url: coverUrl,
          },
        ]
      : [],
  )

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  const handleCoverUpload = ({ file }) => {
    if (file.status === 'removed') {
      onUploadBookCover(null)
    } else {
      onUploadBookCover(file).then(({ data: { uploadBookCover } = {} }) => {
        setCover([
          {
            uid: uploadBookCover.cover[0].fileId,
            name: 'cover',
            status: 'done',
            url: uploadBookCover.cover[0].coverUrl,
          },
        ])
      })
    }
  }

  const handlePreview = async file => {
    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }

  const handleFormUpdate = () => {
    setTimeout(() => {
      form
        .validateFields()
        .then(values => {
          onSubmitBookMetadata(values)
          // TODO: improvement - post only the fields that have changes
          // const diff = reduce(
          //   values,
          //   function (result, value, key) {
          //     return _.isEqual(value, transformedInitialValues[key])
          //     ? result
          //     : result.concat(key)
          //   },
          //   [],
          // )
        })
        .catch(info => {
          console.error(info)

          console.error('Validate Failed:', info)
        })
    })
  }

  // if (!initialValues.title) {
  //   return <Spin spinning style={{ display: 'grid', placeContent: 'center' }} />
  // }

  return (
    <Box className={className}>
      <Center>
        <Form
          form={form}
          initialValues={transformedInitialValues}
          onValuesChange={handleFormUpdate}
          preserve={false}
        >
          <h1>{t('title')}</h1>
          <p>{t('introduction')}</p>
          <FormSection>
            <h2>{t('sections.coverPage.heading')}</h2>
            <Form.Item
              label={t('sections.coverPage.upload.instructions')}
              labelCol={{ span: 24 }}
              valuePropName="fileList"
            >
              <Upload
                accept="image/*"
                beforeUpload={() => false}
                disabled={!canChangeMetadata}
                fileList={cover}
                listType="picture-card"
                maxCount={1}
                onChange={handleCoverUpload}
                onPreview={handlePreview}
                onRemove={() => setCover([])}
              >
                {cover?.length === 0 ? (
                  <button
                    style={{ border: 0, background: 'none' }}
                    type="button"
                  >
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>
                      {t('sections.coverPage.upload.button')}
                    </div>
                  </button>
                ) : null}
              </Upload>
              {previewImage && (
                <Image
                  preview={{
                    visible: previewOpen,
                    onVisibleChange: visible => setPreviewOpen(visible),
                    afterOpenChange: visible => !visible && setPreviewImage(''),
                  }}
                  src={previewImage}
                  wrapperStyle={{ display: 'none' }}
                />
              )}
            </Form.Item>
            {cover?.length > 0 ? (
              <Form.Item
                label={t('sections.coverPage.altText')}
                labelCol={{ span: 24 }}
                name="coverAlt"
              >
                <Input disabled={!canChangeMetadata} />
              </Form.Item>
            ) : null}
          </FormSection>
          <FormSection>
            <h2>{t('sections.titlePage.heading')}</h2>
            <Form.Item
              label={t('sections.titlePage.title')}
              labelCol={{ span: 24 }}
              name="title"
              rules={[
                {
                  required: true,
                  message: t('sections.titlePage.title.errors.noValue'),
                },
              ]}
              wrapperCol={{ span: 24 }}
            >
              <Input disabled={!canChangeMetadata} />
            </Form.Item>
            <Form.Item
              label={t('sections.titlePage.subtitle')}
              labelCol={{ span: 24 }}
              name="subtitle"
              wrapperCol={{ span: 24 }}
            >
              <Input
                disabled={!canChangeMetadata}
                placeholder={t('sections.titlePage.subtitle.placeholder')}
              />
            </Form.Item>
            <Form.Item
              label={t('sections.titlePage.authors')}
              labelCol={{ span: 24 }}
              name="authors"
              wrapperCol={{ span: 24 }}
            >
              <Input
                disabled={!canChangeMetadata}
                placeholder={t('sections.titlePage.authors.placeholder')}
              />
            </Form.Item>
          </FormSection>

          <FormSection>
            <h2>{t('sections.copyrightPage.heading')}</h2>
            <Form.Item
              label={t('sections.copyrightPage.isbnList')}
              labelCol={{ span: 24 }}
              style={{ marginBottom: '0px' }}
              wrapperCol={{ span: 24 }}
            >
              <ISBNList canChangeMetadata={canChangeMetadata} name="isbns" />
            </Form.Item>
            <Form.Item
              label={t('sections.copyrightPage.pageContent.top')}
              labelCol={{ span: 24 }}
              name="topPage"
              wrapperCol={{ span: 24 }}
            >
              <TextArea
                disabled={!canChangeMetadata}
                placeholder={t(
                  'sections.copyrightPage.pageContent.top.placeholder',
                )}
              />
            </Form.Item>
            <Form.Item
              label={t('sections.copyrightPage.pageContent.bottom')}
              labelCol={{ span: 24 }}
              name="bottomPage"
              wrapperCol={{ span: 24 }}
            >
              <TextArea
                disabled={!canChangeMetadata}
                placeholder={t(
                  'sections.copyrightPage.pageContent.bottom.placeholder',
                )}
              />
            </Form.Item>
            <Form.Item
              label={t('sections.copyrightPage.license')}
              labelCol={{ span: 24 }}
              name="copyrightLicense"
              wrapperCol={{ span: 24 }}
            >
              <CopyrightLicenseInput canChangeMetadata={canChangeMetadata} />
            </Form.Item>
          </FormSection>
        </Form>
      </Center>
    </Box>
  )
}

BookMetadataForm.propTypes = {
  /* eslint-disable-next-line react/forbid-prop-types */
  initialValues: PropTypes.shape({
    coverUrl: PropTypes.string,
    coverAlt: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    authors: PropTypes.string.isRequired,
    isbns: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        isbn: PropTypes.string.isRequired,
      }),
    ).isRequired,
    topPage: PropTypes.string,
    bottomPage: PropTypes.string,
    copyrightLicense: PropTypes.oneOf(['SCL', 'PD', 'CC']),
    ncCopyrightHolder: PropTypes.string,
    ncCopyrightYear: PropTypes.string,
    // ncCopyrightYear: PropTypes.instanceOf(dayjs),
    saCopyrightHolder: PropTypes.string,
    saCopyrightYear: PropTypes.string,

    // saCopyrightYear: PropTypes.instanceOf(dayjs),
    licenseTypes: PropTypes.shape({
      NC: PropTypes.bool,
      SA: PropTypes.bool,
      ND: PropTypes.bool,
    }),
    publicDomainType: PropTypes.oneOf(['cc0', 'public']),
  }).isRequired,
  canChangeMetadata: PropTypes.bool.isRequired,
  onSubmitBookMetadata: PropTypes.func.isRequired,
  onUploadBookCover: PropTypes.func.isRequired,
}

export default BookMetadataForm
