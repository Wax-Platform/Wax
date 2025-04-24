import React from 'react'
import PropTypes from 'prop-types'
import Form from './Form'
import Select from './Select'

const TopicAndSubtopic = props => {
  const {
    filterMode,
    getFieldValue,
    isRequired,
    index,
    readOnly,
    setFieldsValue,
    subtopicKey,
    supplementaryKey,
    topicKey,
    topicsMetadata,
  } = props

  const topicName = supplementaryKey ? [index, topicKey] : topicKey

  const topicField = supplementaryKey
    ? [supplementaryKey, index, topicKey]
    : topicKey

  const subtopicName = supplementaryKey ? [index, subtopicKey] : subtopicKey

  const handleTopicChange = () => {
    if (supplementaryKey) {
      const cloned = [...getFieldValue(supplementaryKey)]

      cloned[index] = {
        ...cloned[index],
        [subtopicKey]: null,
      }

      setFieldsValue({
        [supplementaryKey]: cloned,
      })
    } else {
      setFieldsValue({
        [subtopicKey]: null,
      })
    }
  }

  const filterSubtopicOptions = () => {
    const selectedTopic = getFieldValue(topicField)

    if (selectedTopic) {
      return topicsMetadata.find(t => t.value === selectedTopic).subtopics
    }

    const allSubtopics = topicsMetadata
      .map(t => t.subtopics)
      .flat()
      .map(s => ({
        label: s.label,
        value: s.value,
      }))

    return allSubtopics
  }

  return (
    <>
      <Form.Item
        label="Topic"
        name={topicName}
        rules={[
          isRequired ? { required: true, message: 'Topic is required' } : {},
        ]}
      >
        <Select
          // allowClear
          disabled={readOnly}
          onChange={handleTopicChange}
          optionFilterProp="label"
          options={topicsMetadata.map(t => ({
            label: t.label,
            value: t.value,
          }))}
          showSearch
        />
      </Form.Item>
      <Form.Item dependencies={[topicField]} noStyle>
        {() => (
          <Form.Item
            label="Subtopic"
            name={subtopicName}
            rules={[
              isRequired
                ? { required: true, message: 'Subtopic is required' }
                : {},
            ]}
          >
            <Select
              // allowClear
              disabled={readOnly || (!filterMode && !getFieldValue(topicField))}
              optionFilterProp="label"
              options={filterSubtopicOptions()}
              showSearch
            />
          </Form.Item>
        )}
      </Form.Item>
    </>
  )
}

TopicAndSubtopic.propTypes = {
  filterMode: PropTypes.bool,
  getFieldValue: PropTypes.func.isRequired,
  isRequired: PropTypes.bool,
  index: PropTypes.number,
  readOnly: PropTypes.bool,
  setFieldsValue: PropTypes.func.isRequired,
  subtopicKey: PropTypes.string,
  supplementaryKey: PropTypes.string,
  topicKey: PropTypes.string,
  topicsMetadata: PropTypes.arrayOf(PropTypes.shape()).isRequired,
}

TopicAndSubtopic.defaultProps = {
  readOnly: false,
  index: 1,
  isRequired: false,
  filterMode: false,
  subtopicKey: 'subtopic',
  supplementaryKey: '',
  topicKey: 'topic',
}

export default TopicAndSubtopic
