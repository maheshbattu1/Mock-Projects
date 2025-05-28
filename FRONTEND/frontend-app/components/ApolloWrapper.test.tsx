import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import ApolloWrapper from '../components/ApolloWrapper';

// Example component that uses Apollo
const TestComponent = () => {
  return (
    <div>
      <h1>Apollo Client Test</h1>
      <p>This component is wrapped by ApolloWrapper</p>
    </div>
  );
};

// Example query - replace with a real query from your app
const TEST_QUERY = gql`
  query TestQuery {
    hello
  }
`;

describe('ApolloWrapper Component', () => {
  test('renders children correctly', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ApolloWrapper>
          <TestComponent />
        </ApolloWrapper>
      </MockedProvider>
    );

    expect(screen.getByText('Apollo Client Test')).toBeInTheDocument();
    expect(screen.getByText('This component is wrapped by ApolloWrapper')).toBeInTheDocument();
  });
});
