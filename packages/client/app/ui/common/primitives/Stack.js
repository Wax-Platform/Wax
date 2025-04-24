import styled from 'styled-components'

export default styled.div`
  --space: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  > * {
    /* ↓ Any extant vertical margins are removed */
    margin-bottom: 0;
    margin-top: 0;
  }

  > * + * {
    /* ↓ Top margin is only applied to successive elements */
    margin-top: var(--space, 2.5rem);
  }
`
