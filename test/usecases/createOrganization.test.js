import createOrganization from "../../src/usecases/createOrganization";

describe("createOrganizationList", () => {
  it("create an Organization", async () => {
    const oneSpy = jest.fn().mockReturnValue({ id: 1 });
    const inputSpy = jest.fn().mockReturnValue({
      organizationId: 1,
      error: null,
    });

    const container = {
      async getDb() {
        return {
          one: oneSpy,
        };
      },
      getCreateOrganizationGateway: () => inputSpy,
    };

    const request = { name: "Test Trust", status: 0 };

    const { organizationId, error } = await createOrganization(container)(
      request
    );
    expect(organizationId).toEqual(1);
    expect(error).toBeNull();
    expect(inputSpy).toHaveBeenCalledWith("Test Trust", 0);
  });

  it("returns an error object on db exception", async () => {
    const container = {
      async getDb() {
        return {
          one: jest.fn(() => {
            throw new Error("DB Error!");
          }),
        };
      },
      getCreateOrganizationGateway: () =>
        jest.fn().mockReturnValue({
          organizationId: null,
          error: "Error: DB Error!",
        }),
    };

    const { organizationId, error } = await createOrganization(container)({
      name: "Test Trust",
    });

    expect(error).toEqual("Error: DB Error!");
    expect(organizationId).toBeNull();
  });
});
