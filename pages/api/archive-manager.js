import withContainer from "../../src/middleware/withContainer";
import {
  validateHttpMethod,
  checkIfAuthorised,
} from "../../src/helpers/apiErrorHandler";

export default withContainer(
  async ({ headers, body, method }, res, { container }) => {
    validateHttpMethod("DELETE", method, res);

    const trustAdminIsAuthenticated = container.getTrustAdminIsAuthenticated();

    const trustAdminAuthenticatedToken = trustAdminIsAuthenticated(
      headers.cookie
    );

    checkIfAuthorised(trustAdminAuthenticatedToken, res);

    if (!body.uuid) {
      res.status(400);
      res.end(JSON.stringify({ error: "Manager uuid must be present" }));
      return;
    }

    res.setHeader("Content-Type", "application/json");

    console.log("*********BODY.UUID********");
    console.log(body.uuid);
    const archiveManagerByUuid = container.getArchiveManagerByUuid();

    const { error } = await archiveManagerByUuid(body.uuid);

    if (error) {
      res.status(400);
    } else {
      res.status(200);
    }
    res.end(JSON.stringify({ error }));
  }
);