import { Children } from 'react'

const Each = ({ render, of, condition = true, fallback }) =>
  condition ? Children.toArray(of.map((item, i) => render(item, i))) : fallback

export default Each
