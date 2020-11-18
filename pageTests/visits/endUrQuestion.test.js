import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import EndUrQuestion, {
  getServerSideProps,
} from "../../pages/visits/endUrQuestion";
import nock from "nock";

describe("end UR question", () => {
  beforeAll(() => {
    process.env.UR_QUESTION = true;
  });

  let urQuestionEndpointStub;

  beforeEach(() => {
    urQuestionEndpointStub = nock("http://localhost:3001", {
      //allowUnmocked: true,
    })
      .matchHeader("X-Correlation-ID", "1-ur-question")
      .matchHeader("content-type", "application/json")
      .post("/api/submit-ur-question", "{}")
      .reply(201);
  });

  afterEach(() => {});

  afterAll(() => {
    process.env.UR_QUESTION = false;
  });

  describe("<EndUrQuestion/>", () => {
    it("submits the results of the ur question", async () => {
      render(<EndUrQuestion correlationId="1-ur-question" />);
      await act(async () => {
        fireEvent.submit(screen.getByTestId("ur-question-form"));
      });
      expect(urQuestionEndpointStub.isDone()).toBeTruthy();
    });
  });

  describe("getServerSideProps", () => {
    it("redirects to the end screen for staff members", async () => {
      //If there is a wardId we're a staff member
      const container = {
        getUserIsAuthenticated: () =>
          jest.fn().mockResolvedValue({ ward: "test-ward-id" }),
      };
      const res = {
        writeHead: jest.fn().mockReturnValue({ end: () => {} }),
        status: jest.fn(),
      };
      const req = {
        headers: {},
      };

      const callId = "112";
      await getServerSideProps({ req, query: { callId }, res, container });

      expect(res.writeHead).toHaveBeenCalledWith(302, {
        Location: `/visits/end?callId=${callId}`,
      });
    });

    it("does not redirect to the end screen for key contacts", async () => {
      const container = {
        getUserIsAuthenticated: () => jest.fn().mockResolvedValue({}),
      };
      const res = {
        writeHead: jest.fn().mockReturnValue({ end: () => {} }),
        status: jest.fn(),
      };
      const req = {
        headers: {},
      };

      const callId = "112";
      await getServerSideProps({ req, query: { callId }, res, container });

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});