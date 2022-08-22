import { useState } from 'react';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Input from '@cloudscape-design/components/input';
import Button from '@cloudscape-design/components/button';

export default function Home() {
  const [value, setValue] = useState('');

  return (
    <SpaceBetween size='m'>
      <Header variant='h1'>Hello World!</Header>

      <Container>
        <SpaceBetween size='s'>
          <span>Start editing to see some magic happen</span>
          <Input
            value={value}
            onChange={(event) => setValue(event.detail.value)}
          />
          <Button variant='primary'>Click me</Button>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
}
