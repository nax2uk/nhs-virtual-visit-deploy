import archiveWard from "../../../pages/api/archive-ward";

jest.mock("node-fetch");

describe("archive-ward", () => {
  let validRequest;
  let response;
  let container;

  beforeEach(() => {
    validRequest = {
      method: "DELETE",
      body: {
        wardId: "1",
        trustId: "1",
      },
      headers: {
        cookie: "token=valid.token.value",
      },
    };
    response = {
      status: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn(),
      end: jest.fn(),
      body: jest.fn(),
    };
    container = {
      getArchiveDepartment: jest.fn().mockReturnValue(() => {
        return { success: true, error: null };
      }),
      getOrganisationAdminIsAuthenticated: jest
        .fn()
        .mockReturnValue(
          (cookie) => cookie === "token=valid.token.value" && { trustId: "1" }
        ),
    };
  });

  it("returns 405 if not DELETE method", async () => {
    validRequest.method = "GET";

    await archiveWard(validRequest, response, {
      container: container,
    });

    expect(response.status).toHaveBeenCalledWith(405);
  });

  it("returns a 401 if not a trust admin", async () => {
    const trustAdminIsAuthenticatedSpy = jest.fn().mockReturnValue(false);

    await archiveWard(
      {
        method: "DELETE",
        body: {},
        headers: {},
      },
      response,
      {
        container: {
          ...container,
          getOrganisationAdminIsAuthenticated: () =>
            trustAdminIsAuthenticatedSpy,
        },
      }
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(trustAdminIsAuthenticatedSpy).toHaveBeenCalled();
  });

  it("archives a ward if valid", async () => {
    const archiveWardSpy = jest
      .fn()
      .mockReturnValue({ success: true, error: null });

    await archiveWard(validRequest, response, {
      container: {
        ...container,
        getArchiveDepartment: () => archiveWardSpy,
      },
    });

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.end).toHaveBeenCalledWith(JSON.stringify(true));
    expect(archiveWardSpy).toHaveBeenCalledWith("1", "1");
  });

  it("returns a 400 status if errors", async () => {
    const archiveWardStub = jest
      .fn()
      .mockReturnValue({ success: false, error: "Failed to remove ward" });

    await archiveWard(validRequest, response, {
      container: {
        ...container,
        getArchiveDepartment: () => archiveWardStub,
      },
    });

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it("returns a 400 if the ward id is an empty string", async () => {
    const invalidRequest = {
      method: "DELETE",
      body: {
        wardId: "",
      },
      headers: {
        cookie: "token=valid.token.value",
      },
    };

    await archiveWard(invalidRequest, response, {
      container: {
        ...container,
      },
    });

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.end).toHaveBeenCalledWith(
      JSON.stringify({ err: "ward id must be present" })
    );
  });
});
