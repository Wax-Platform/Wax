import { Children } from 'react'
import PropTypes from 'prop-types'

const Each = ({ render, of, condition, fallback }) =>
  condition ? Children.toArray(of.map((item, i) => render(item, i))) : fallback

Each.propTypes = {
  render: PropTypes.func,
  of: PropTypes.instanceOf(Array),
  condition: PropTypes.bool,
  fallback: PropTypes.func,
}

Each.defaultProps = {
  render: null,
  of: [],
  condition: true,
  fallback: null,
}

export default Each
