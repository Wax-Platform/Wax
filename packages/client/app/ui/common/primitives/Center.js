import styled from 'styled-components'

export default styled.div`
  --max-width: 70ch;
  --min-width: 0;
  --s1: 1em;
  /* ↓ Remove padding from the width calculation */
  box-sizing: content-box;
  /* ↓ Only affect horizontal margins */
  margin-inline: auto;
  /* ↓ The maximum width is the maximum measure */
  max-width: var(--max-width, 70ch);
  min-width: var(--min-width, 0);
  /* ↓ Apply the minimum horizontal space */
  padding-inline: var(--s1);
`
