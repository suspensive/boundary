import styled from '@emotion/styled'
import Link from 'next/link'
import { Area, Box } from '../components/uis'

const Home = () => (
  <Container>
    <Area title="Check Concepts">
      <Flex>
        <Link href="/react" style={{ flex: 1 }}>
          <Box.Default>🔗 @suspensive/react</Box.Default>
        </Link>
        <Link href="/react-query" style={{ flex: 1 }}>
          <Box.Default>🔗 @suspensive/react-query</Box.Default>
        </Link>
      </Flex>
    </Area>
  </Container>
)

export default Home

const Container = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  margin: -5vh 16px 0 16px;
`

const Flex = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-direction: column;

  @media (min-width: 700px) {
    flex-direction: row;
  }
`
