/* eslint-disable no-console */

import React from 'react'
import { faker } from '@faker-js/faker'

import Template from '../../app/ui/preview/Template'
import thumbnails from './static'

const args = {
  id: '1',
  // imageUrl:
  //   'https://fastly.picsum.photos/id/11/82/100.jpg?hmac=solY9YT1h0M-KJfh8WKXqPfbFygW52ideb5Hf1VCKgc',
  imageUrl: thumbnails.bikini,
  isSelected: false,
  name: faker.lorem.word(),
  onClick: () => {
    console.log('clicked the template!')
  },
}

export const Base = () => <Template {...args} />
export const LongName = () => <Template {...args} name={faker.lorem.words(4)} />
export const Selected = () => <Template {...args} isSelected />

export const MissingImage = () => <Template {...args} imageUrl={null} />

export default {
  component: Template,
  title: 'Preview/Template',
}
