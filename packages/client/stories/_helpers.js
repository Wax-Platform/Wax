import React from 'react'
import styled from 'styled-components'
import { faker } from '@faker-js/faker'
import { range } from 'lodash'

/**
 * Wrap components around this to show what they will look like
 * with the grey body background
 */
export const Background = styled.div`
  background: ${props => props.theme.colorBody};
  padding: 40px;
`

const StyledFiller = styled.div`
  align-items: center;
  background: ${props => props.theme.colorSecondary};
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: center;
  margin-bottom: 16px;
  padding: 48px;
  text-align: justify;

  > div {
    font-weight: bold;
    text-align: center;
  }
`

/**
 * Just a block with some text in it
 */
export const Filler = () => {
  return (
    <StyledFiller>
      <div>Filler</div>
      <span>{faker.lorem.sentences(10)}</span>
    </StyledFiller>
  )
}

/**
 * Picks a random item from any given array
 */
export const randomPick = array =>
  array[Math.floor(Math.random() * array.length)]

/**
 * Picks n values randomly from given array
 */
export const randomArray = (array, n) => {
  const res = []

  while (res.length < n) {
    const v = randomPick(array)
    if (!res.includes(v)) res.push(v)
  }

  return res
}

/**
 * Randomly picks true or false
 */
export const randomBool = () => randomPick([true, false])

/**
 * Creates an array of length n of whatever the callback returns
 */
export const createData = (n, callback) => range(n).map(callback)

/**
 * Just an empty function to use as a placeholder for required functions
 */

export const noop = () => {}
