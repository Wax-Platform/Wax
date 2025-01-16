import { Children } from 'react'

const Each = props =>
  props.if
    ? Children.toArray(props.of.map((item, i) => props.as(item, i)))
    : props.or || null

export default Each
