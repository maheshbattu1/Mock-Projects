import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SigninPage from "./page";
import { MockedProvider } from "@apollo/client/testing";
import { SIGNIN_MUTATION } from "@/graphql/mutations";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

const mocks = [
  {
    request: {
      query: SIGNIN_MUTATION,
      variables: { email: "test@example.com", password: "password123" },
    },
    result: {
      data: {
        signin: {
          success: true,
          message: "Signin successful!",
          user: {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            __typename: "User",
          },
          __typename: "SigninResponse",
        },
      },
    },
  },
];

describe("Signin Page", () => {
  it("renders the signin form", () => {
    render(
      <MockedProvider mocks={mocks}>
        <SigninPage />
      </MockedProvider>
    );

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("submits the form", () => {
    render(
      <MockedProvider mocks={mocks}>
        <SigninPage />
      </MockedProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();
  });
});