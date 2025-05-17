import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SignupPage from "./page";
import { MockedProvider } from "@apollo/client/testing";
import { SIGNUP_MUTATION } from "@/graphql/mutations";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

const mocks = [
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: { name: "Test User", email: "test@example.com", password: "password123" },
    },
    result: {
      data: {
        signup: {
          success: true,
          message: "Signup successful!",
          __typename: "SignupResponse",
        },
      },
    },
  },
];

describe("Signup Page", () => {
  it("renders the signup form", () => {
    render(
      <MockedProvider>
        <SignupPage />
      </MockedProvider>
    );

    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("submits the form", () => {
    render(
      <MockedProvider mocks={mocks}>
        <SignupPage />
      </MockedProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(screen.getByText(/Signing up.../i)).toBeInTheDocument();
  });
});