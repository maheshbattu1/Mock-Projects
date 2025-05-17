import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "./Header";
import { MockedProvider } from "@apollo/client/testing";
import { ME_QUERY } from "@/graphql/quaries";

const mocks = [
  {
    request: {
      query: ME_QUERY,
    },
    result: {
      data: {
        me: {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "USER",
          __typename: "User",
        },
      },
    },
  },
];

describe("Header Component", () => {
  it("renders the header with the title", () => {
    render(
      <MockedProvider mocks={mocks}>
        <Header />
      </MockedProvider>
    );

    expect(screen.getByText("DWELZO")).toBeInTheDocument();
  });
});