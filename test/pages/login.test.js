import React from "react";
import { waitFor, screen, render, fireEvent } from "@testing-library/react";
import Login, { getServerSideProps } from "../../pages/login";
import fetchMock from "jest-fetch-mock";

jest.mock("uuid", () => ({
  v4: () => "uuidv4",
}));

describe("login", () => {
  let res;
  beforeEach(() => {
    res = {
      writeHead: jest.fn().mockReturnValue({ end: () => {} }),
    };

    // Enable mock on fetch module. Bypass fetch external call
    fetchMock.doMock();

    // Reset fetch mocks
    fetchMock.resetMocks();

    // Login redirect window.location.href
    global.window = Object.create(window);
    const url = "http://dummy.com";
    Object.defineProperty(window, "location", {
      value: {
        href: url,
      },
      writable: true,
    });
  });

  const authenticatedReq = {
    headers: {
      cookie: "token=123",
    },
  };

  it("login success, redirect admin page", async () => {
    render(<Login />);

    await waitFor(() => {
      var inputEmail = screen.getByLabelText("Email");

      fireEvent.change(inputEmail, { target: { value: "emai@mail.com" } });

      expect(inputEmail.value).toEqual("emai@mail.com");

      var inputPwd = screen.getByLabelText("Password");

      fireEvent.change(inputPwd, { target: { value: "23" } });

      expect(inputPwd.value).toEqual("23");
    });

    fetchMock.mockResolvedValue({
      status: 201,
      json: jest.fn(() => {
        return {
          userType: "admin",
        };
      }),
    });

    await waitFor(() => {
      const btnSubmit = screen.getByText("Log in");
      var clicked = fireEvent.click(btnSubmit);

      expect(clicked).toBeTruthy();
    });

    await waitFor(() => {
      const errorMissingEmail = screen.queryAllByText("Enter an email");
      expect(errorMissingEmail.length).toBe(0);

      const errorMissingPassword = screen.queryAllByText("Enter a password");
      expect(errorMissingPassword.length).toBe(0);
    });
  });

  it("login success, redirect manager page", async () => {
    render(<Login />);

    await waitFor(() => {
      var inputEmail = screen.getByLabelText("Email");

      fireEvent.change(inputEmail, { target: { value: "emai@mail.com" } });

      expect(inputEmail.value).toEqual("emai@mail.com");

      var inputPwd = screen.getByLabelText("Password");

      fireEvent.change(inputPwd, { target: { value: "23" } });

      expect(inputPwd.value).toEqual("23");
    });

    fetchMock.mockResolvedValue({
      status: 201,
      json: jest.fn(() => {
        return {
          userType: "manager",
        };
      }),
    });

    await waitFor(() => {
      const btnSubmit = screen.getByText("Log in");
      var clicked = fireEvent.click(btnSubmit);

      expect(clicked).toBeTruthy();
    });

    await waitFor(() => {
      const errorMissingEmail = screen.queryAllByText("Enter an email");
      expect(errorMissingEmail.length).toBe(0);

      const errorMissingPassword = screen.queryAllByText("Enter a password");
      expect(errorMissingPassword.length).toBe(0);
    });
  });

  it("login failure, incorrect email or password", async () => {
    render(<Login />);

    await waitFor(() => {
      var inputEmail = screen.getByLabelText("Email");

      fireEvent.change(inputEmail, { target: { value: "emai@mail.com" } });

      expect(inputEmail.value).toEqual("emai@mail.com");

      var inputPwd = screen.getByLabelText("Password");

      fireEvent.change(inputPwd, { target: { value: "23" } });

      expect(inputPwd.value).toEqual("23");
    });

    await waitFor(() => {
      const btnSubmit = screen.getByText("Log in");
      var clicked = fireEvent.click(btnSubmit);

      expect(clicked).toBeTruthy();
    });

    await waitFor(() => {
      const errorMissingEmail = screen.queryAllByText("Enter an email");
      expect(errorMissingEmail.length).toBe(0);

      const errorMissingPassword = screen.queryAllByText("Enter a password");
      expect(errorMissingPassword.length).toBe(0);
    });
  });

  it("login failure missing email and password", async () => {
    render(<Login />);

    await waitFor(() => {
      const btnSubmit = screen.getByText("Log in");
      var clicked = fireEvent.click(btnSubmit);

      expect(clicked).toBeTruthy();
    });

    await waitFor(() => {
      const errorMissingEmail = screen.queryAllByText("Enter an email");
      expect(errorMissingEmail.length).toBeGreaterThan(0);

      const errorMissingPassword = screen.queryAllByText("Enter a password");
      expect(errorMissingPassword.length).toBeGreaterThan(0);
    });
  });

  it("login failure missing email", async () => {
    render(<Login />);

    await waitFor(() => {
      var inputPwd = screen.getByLabelText("Password");

      fireEvent.change(inputPwd, { target: { value: "23" } });

      expect(inputPwd.value).toEqual("23");
    });

    await waitFor(() => {
      const btnSubmit = screen.getByText("Log in");
      var clicked = fireEvent.click(btnSubmit);

      expect(clicked).toBeTruthy();
    });

    await waitFor(() => {
      const errorMissingEmail = screen.queryAllByText("Enter an email");
      expect(errorMissingEmail.length).toBeGreaterThan(0);

      const errorMissingPassword = screen.queryAllByText("Enter a password");
      expect(errorMissingPassword.length).toBe(0);
    });
  });

  it("login failure missing password", async () => {
    render(<Login />);

    await waitFor(() => {
      var inputEmail = screen.getByLabelText("Email");

      fireEvent.change(inputEmail, { target: { value: "emai@mail.com" } });

      expect(inputEmail.value).toEqual("emai@mail.com");
    });

    await waitFor(() => {
      const btnSubmit = screen.getByText("Log in");
      var clicked = fireEvent.click(btnSubmit);

      expect(clicked).toBeTruthy();
    });

    await waitFor(() => {
      const errorMissingEmail = screen.queryAllByText("Enter an email");
      expect(errorMissingEmail.length).toBe(0);

      const errorMissingPassword = screen.queryAllByText("Enter a password");
      expect(errorMissingPassword.length).toBeGreaterThan(0);
    });
  });

  it("redirects to trust-admin page if there is a trust-admin token", async () => {
    const container = {
      getUserIsAuthenticated: () => jest.fn(),
      getTrustAdminIsAuthenticated: () => jest.fn(async () => "trusttoken"),
      getAdminIsAuthenticated: () => jest.fn(),
    };

    await getServerSideProps({ req: authenticatedReq, res, container });

    expect(res.writeHead).toHaveBeenCalledWith(307, {
      Location: "/trust-admin",
    });
  });

  it("redirects to admin page if there is a admin token", async () => {
    const container = {
      getUserIsAuthenticated: () => jest.fn(),
      getTrustAdminIsAuthenticated: () => jest.fn(),
      getAdminIsAuthenticated: () => jest.fn(async () => "admintoken"),
    };

    await getServerSideProps({ req: authenticatedReq, res, container });

    expect(res.writeHead).toHaveBeenCalledWith(307, {
      Location: "/admin",
    });
  });

  it("redirects to wards page if there is a wards token", async () => {
    const container = {
      getUserIsAuthenticated: () =>
        jest.fn().mockResolvedValue({ ward: "my-test-ward" }),
      getTrustAdminIsAuthenticated: () => jest.fn(),
      getAdminIsAuthenticated: () => jest.fn(),
    };

    const req = { headers: { cookie: "" } };

    await getServerSideProps({ req, res, container });

    expect(res.writeHead).toHaveBeenCalledWith(307, {
      Location: "/wards/visits",
    });
  });

  it("returns the correlationId as props if there is no token", async () => {
    const container = {
      getUserIsAuthenticated: () => jest.fn(),
      getTrustAdminIsAuthenticated: () => jest.fn(),
      getAdminIsAuthenticated: () => jest.fn(),
    };

    const req = { headers: { cookie: "" } };

    const { props } = await getServerSideProps({ req, res, container });

    expect(props.correlationId).toEqual("uuidv4-admin-login");
  });
});
