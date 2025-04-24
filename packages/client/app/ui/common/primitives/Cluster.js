import styled from 'styled-components'

export default styled.div`
  --justify: start;
  --align: center;
  /* ↓ Choose your alignment (center is default) */
  align-items: var(--align);
  /* ↓ Set the Flexbox context */
  display: flex;
  /* ↓ Enable wrapping */
  flex-wrap: wrap;
  /* ↓ Set the space/gap */
  gap: var(--cluster-gap, 1rem);
  /* ↓ Choose your justification (center is default) */
  justify-content: var(--justify);
`
