import React from 'react'
import PropTypes from 'prop-types'
import { uuid } from '@coko/client/dist'
import { uniqBy } from 'lodash'
import Form from './Form'
import Select from './Select'

const VisionAndChangeMetadata = props => {
  const {
    conceptsAndCompetencies,
    filterMode,
    getFieldValue,
    readOnly,
    setFieldsValue,
    coreConceptKey,
    subdisciplineKey,
    subdisciplineStatementKey,
    coreCompetenceKey,
    subcompetenceKey,
    subcompetenceStatementKey,
    supplementaryKey,
    index,
  } = props

  const coreConceptName = supplementaryKey
    ? [index, coreConceptKey]
    : coreConceptKey

  const coreConceptField = supplementaryKey
    ? [supplementaryKey, index, coreConceptKey]
    : coreConceptKey

  const subdisciplineName = supplementaryKey
    ? [index, subdisciplineKey]
    : subdisciplineKey

  const subdisciplineField = supplementaryKey
    ? [supplementaryKey, index, subdisciplineKey]
    : subdisciplineKey

  const subdisciplineStatementName = supplementaryKey
    ? [index, subdisciplineStatementKey]
    : subdisciplineStatementKey

  const coreCompetenceName = supplementaryKey
    ? [index, coreCompetenceKey]
    : coreCompetenceKey

  const coreCompetenceField = supplementaryKey
    ? [supplementaryKey, index, coreCompetenceKey]
    : coreCompetenceKey

  const subcompetenceName = supplementaryKey
    ? [index, subcompetenceKey]
    : subcompetenceKey

  const subcompetenceField = supplementaryKey
    ? [supplementaryKey, index, subcompetenceKey]
    : subcompetenceKey

  const subcompetenceStatementName = supplementaryKey
    ? [index, subcompetenceStatementKey]
    : subcompetenceStatementKey

  const handleCoreConceptChange = () => {
    if (supplementaryKey) {
      const cloned = [...getFieldValue(supplementaryKey)]

      cloned[index] = {
        ...cloned[index],
        [subdisciplineKey]: null,
        [subdisciplineStatementKey]: null,
      }

      setFieldsValue({
        [supplementaryKey]: cloned,
      })
    } else {
      setFieldsValue({
        [subdisciplineKey]: null,
        [subdisciplineStatementKey]: null,
      })
    }
  }

  const handleSubdisciplineChange = () => {
    if (supplementaryKey) {
      const cloned = [...getFieldValue(supplementaryKey)]

      cloned[index] = {
        ...cloned[index],
        [subdisciplineStatementKey]: null,
      }

      setFieldsValue({
        [supplementaryKey]: cloned,
      })
    } else {
      setFieldsValue({
        [subdisciplineStatementKey]: null,
      })
    }
  }

  const handleCoreCompetenceChange = () => {
    if (supplementaryKey) {
      const cloned = [...getFieldValue(supplementaryKey)]

      cloned[index] = {
        ...cloned[index],
        [subcompetenceKey]: null,
        [subcompetenceStatementKey]: null,
      }

      setFieldsValue({
        [supplementaryKey]: cloned,
      })
    } else {
      setFieldsValue({
        [subcompetenceKey]: null,
        [subcompetenceStatementKey]: null,
      })
    }
  }

  const handleSubcompetenceChange = () => {
    if (supplementaryKey) {
      const cloned = [...getFieldValue(supplementaryKey)]

      cloned[index] = {
        ...cloned[index],
        [subcompetenceStatementKey]: null,
      }

      setFieldsValue({
        [supplementaryKey]: cloned,
      })
    } else {
      setFieldsValue({
        [subcompetenceStatementKey]: null,
      })
    }
  }

  const filterCoreConceptsOptions = () => {
    return conceptsAndCompetencies.coreConcepts.map(c => ({
      label: c.label,
      value: c.value,
    }))
  }

  const filterSubdisciplineOptions = () => {
    return uniqBy(
      conceptsAndCompetencies.subdisciplines?.map(s => ({
        label: s.label,
        value: s.value,
      })),
      'value',
    )
  }

  const filterSubdisciplineStatementOptions = () => {
    const selectedCoreConcept = getFieldValue(coreConceptField)
    const selectedSubdiscipline = getFieldValue(subdisciplineField)

    if (selectedCoreConcept && !selectedSubdiscipline) {
      return conceptsAndCompetencies.subdisciplineStatements
        .filter(s => s.coreConcept === selectedCoreConcept)
        .map(s => ({
          label: s.label,
          value: s.value,
        }))
    }

    if (!selectedCoreConcept && selectedSubdiscipline) {
      return conceptsAndCompetencies.subdisciplineStatements
        .filter(s => s.subdiscipline === selectedSubdiscipline)
        .map(s => ({
          label: s.label,
          value: s.value,
        }))
    }

    if (selectedCoreConcept && selectedSubdiscipline) {
      return conceptsAndCompetencies.subdisciplineStatements
        .filter(
          s =>
            s.subdiscipline === selectedSubdiscipline &&
            s.coreConcept === selectedCoreConcept,
        )
        .map(s => ({
          label: s.label,
          value: s.value,
        }))
    }

    return conceptsAndCompetencies.subdisciplineStatements?.map(s => ({
      label: s.label,
      value: s.value,
    }))
  }

  const filterCoreCompetenceOptions = () => {
    return conceptsAndCompetencies.coreCompetencies.map(c => ({
      label: c.label,
      value: c.value,
    }))
  }

  const filterSubcompetenceOptions = () => {
    const selectedCoreCompetence = getFieldValue(coreCompetenceField)

    if (selectedCoreCompetence) {
      return conceptsAndCompetencies.subcompetencies
        .filter(s => s.coreCompetence === selectedCoreCompetence)
        .map(s => ({
          label: s.label,
          value: s.value,
        }))
    }

    return conceptsAndCompetencies.subcompetencies?.map(s => ({
      label: s.label,
      value: s.value,
    }))
  }

  const filterSubcompetenceStatementOptions = () => {
    const selectedCoreCompetence = getFieldValue(coreCompetenceField)
    const selectedSubcompetence = getFieldValue(subcompetenceField)

    if (selectedSubcompetence) {
      return conceptsAndCompetencies.subcompetenceStatements
        .filter(s => s.subcompetence === selectedSubcompetence)
        .map(s => ({
          label: s.label,
          value: s.value,
        }))
    }

    if (selectedCoreCompetence) {
      return conceptsAndCompetencies.subcompetenceStatements
        .filter(s => s.coreCompetence === selectedCoreCompetence)
        .map(s => ({
          label: s.label,
          value: s.value,
        }))
    }

    return conceptsAndCompetencies.subcompetenceStatements?.map(s => ({
      label: s.label,
      value: s.value,
    }))
  }

  const displaySubcompetenceExplanation = () => {
    return conceptsAndCompetencies.subcompetencies.find(
      c => c.value === getFieldValue(subcompetenceField),
    ).explanation
  }

  return (
    <>
      <p>Vision and Change Framework</p>
      <Form.Item label="Core concept" name={coreConceptName}>
        <Select
          // allowClear
          disabled={readOnly}
          onChange={handleCoreConceptChange}
          optionFilterProp="label"
          options={filterCoreConceptsOptions()}
          showSearch
          wrapOptionText
        />
      </Form.Item>
      <Form.Item dependencies={[coreConceptField]} noStyle>
        {() => (
          <>
            {getFieldValue(coreConceptField) && (
              <div>
                <h4>Overarching Principles</h4>
                <ul>
                  {conceptsAndCompetencies.coreConcepts
                    .find(c => c.value === getFieldValue(coreConceptField))
                    .explanatoryItems.map(item => (
                      <li key={uuid()}>{item}</li>
                    ))}
                </ul>
              </div>
            )}
            <Form.Item label="Subdiscipline" name={subdisciplineName}>
              <Select
                // allowClear
                disabled={
                  readOnly || (!filterMode && !getFieldValue(coreConceptField))
                }
                onChange={handleSubdisciplineChange}
                optionFilterProp="label"
                options={filterSubdisciplineOptions()}
                showSearch
                wrapOptionText
              />
            </Form.Item>
          </>
        )}
      </Form.Item>
      <Form.Item dependencies={[coreConceptField, subdisciplineField]} noStyle>
        {() => (
          <Form.Item
            label="Subdiscipline Statement"
            name={subdisciplineStatementName}
          >
            <Select
              // allowClear
              disabled={
                readOnly || (!filterMode && !getFieldValue(subdisciplineField))
              }
              optionFilterProp="label"
              options={filterSubdisciplineStatementOptions()}
              showSearch
              wrapOptionText
            />
          </Form.Item>
        )}
      </Form.Item>

      <Form.Item label="Core competence" name={coreCompetenceName}>
        <Select
          // allowClear
          disabled={readOnly}
          onChange={handleCoreCompetenceChange}
          optionFilterProp="label"
          options={filterCoreCompetenceOptions()}
          showSearch
          wrapOptionText
        />
      </Form.Item>
      <Form.Item dependencies={[coreCompetenceField]}>
        {() => (
          <Form.Item label="Subcompetence" name={subcompetenceName}>
            <Select
              // allowClear
              disabled={
                readOnly || (!filterMode && !getFieldValue(coreCompetenceField))
              }
              onChange={handleSubcompetenceChange}
              optionFilterProp="label"
              options={filterSubcompetenceOptions()}
              showSearch
              wrapOptionText
            />
          </Form.Item>
        )}
      </Form.Item>
      <Form.Item
        dependencies={[coreCompetenceField, subcompetenceField]}
        noStyle
      >
        {() => (
          <>
            {getFieldValue(subcompetenceField) && (
              <p>{displaySubcompetenceExplanation()}</p>
            )}
            <Form.Item
              label="Subcompetence Statement"
              name={subcompetenceStatementName}
            >
              <Select
                // allowClear
                disabled={
                  readOnly ||
                  (!filterMode && !getFieldValue(subcompetenceField))
                }
                optionFilterProp="label"
                options={filterSubcompetenceStatementOptions()}
                showSearch
                wrapOptionText
              />
            </Form.Item>
          </>
        )}
      </Form.Item>
    </>
  )
}

VisionAndChangeMetadata.propTypes = {
  conceptsAndCompetencies: PropTypes.shape().isRequired,
  filterMode: PropTypes.bool,
  getFieldValue: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  setFieldsValue: PropTypes.func.isRequired,
  coreConceptKey: PropTypes.string,
  subdisciplineKey: PropTypes.string,
  subdisciplineStatementKey: PropTypes.string,
  coreCompetenceKey: PropTypes.string,
  subcompetenceKey: PropTypes.string,
  subcompetenceStatementKey: PropTypes.string,
  supplementaryKey: PropTypes.string,
  index: PropTypes.number,
}

VisionAndChangeMetadata.defaultProps = {
  readOnly: false,
  filterMode: false,
  coreConceptKey: 'coreConcept',
  subdisciplineKey: 'subdiscipline',
  subdisciplineStatementKey: 'subdisciplineStatement',
  coreCompetenceKey: 'coreCompetence',
  subcompetenceKey: 'subcompetence',
  subcompetenceStatementKey: 'subcompetenceStatement',
  supplementaryKey: '',
  index: 0,
}

export default VisionAndChangeMetadata
