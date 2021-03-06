import withContainer from "../../src/middleware/withContainer";
import {
  validateHttpMethod,
  checkIfAuthorised,
} from "../../src/helpers/apiErrorHandler";

export default withContainer(
  async ({ headers, body, method }, res, { container }) => {
    validateHttpMethod("POST", method, res);

    const trustAdminIsAuthenticated = container.getOrganisationAdminIsAuthenticated();

    checkIfAuthorised(trustAdminIsAuthenticated(headers.cookie), res);

    if (!body.name) {
      res.status(400);
      res.end(JSON.stringify({ err: "name must be present" }));
      return;
    }

    if (!body.trustId) {
      res.status(400);
      res.end(JSON.stringify({ err: "trust ID must be present" }));
      return;
    }

    res.setHeader("Content-Type", "application/json");

    const createHospital = container.getCreateFacility();

    const { hospitalId, error } = await createHospital({
      name: body.name,
      trustId: body.trustId,
      supportUrl: body.supportUrl,
      surveyUrl: body.surveyUrl,
      code: body.code,
    });

    if (error) {
      res.status(400);
      res.end(JSON.stringify({ err: "Hospital name already exists" }));
    } else {
      res.status(201);
      res.end(JSON.stringify({ hospitalId: hospitalId }));
    }
  }
);
