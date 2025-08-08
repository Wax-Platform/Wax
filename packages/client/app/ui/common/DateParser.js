import propTypes from 'prop-types'
import moment from 'moment'

const getDuration = timestamp => {
  const today = moment()
  const stamp = moment(timestamp)
  return moment.duration(today.diff(stamp))
}

const DateParser = props => {
  const { children, timestamp, dateFormat, humanizeThreshold } = props

  const renderTimestamp = () => {
    if (!timestamp) return ''
    const duration = getDuration(timestamp)

    if (duration.asDays() < humanizeThreshold) {
      return `${duration.humanize()} ago`
    }

    return moment(timestamp).format(dateFormat)
  }

  const renderTimeAgo = () => {
    if (!timestamp) return ''
    const duration = getDuration(timestamp)
    return duration.humanize()
  }

  const timestampValue = renderTimestamp()
  const timeAgoValue = renderTimeAgo()

  return children(timestampValue, timeAgoValue)
}

DateParser.propTypes = {
  /** The date string. Can be any date parsable by momentjs. */
  timestamp: propTypes.oneOfType([propTypes.string, propTypes.number, Date])
    .isRequired,
  /** Format of the rendered date. */
  dateFormat: propTypes.string,
  /** Humanize duration threshold */
  humanizeThreshold: propTypes.number,
}

DateParser.defaultProps = {
  dateFormat: 'DD.MM.YYYY',
  humanizeThreshold: 0,
}

export default DateParser
