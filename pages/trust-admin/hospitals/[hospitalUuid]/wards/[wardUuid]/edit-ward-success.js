import React from "react";
import Error from "next/error";
import Layout from "../../../../../../src/components/Layout";
import AnchorLink from "../../../../../../src/components/AnchorLink";
import propsWithContainer from "../../../../../../src/middleware/propsWithContainer";
import verifyTrustAdminToken from "../../../../../../src/usecases/verifyTrustAdminToken";
import ActionLink from "../../../../../../src/components/ActionLink";
import { TRUST_ADMIN } from "../../../../../../src/helpers/userTypes";
import TrustAdminHeading from "../../../../../../src/components/TrustAdminHeading";
import { GridRow, GridColumn } from "../../../../../../src/components/Grid";
import PanelSuccess from "../../../../../../src/components/PanelSuccess";

const EditAWardSuccess = ({
  error,
  name,
  hospitalName,
  hospitalUuid,
  organisation,
}) => {
  if (error) {
    return <Error />;
  }

  return (
    <Layout
      title={`${name} has been updated`}
      showNavigationBar={true}
      showNavigationBarForType={TRUST_ADMIN}
    >
      <TrustAdminHeading
        trustName={organisation.name}
        subHeading={hospitalName}
      />
      <GridRow>
        <GridColumn width="two-thirds">
          <PanelSuccess
            name={`${name}`}
            action={`updated`}
            subAction={`for ${hospitalName}`}
          />
          <h2>What happens next</h2>
          <ActionLink
            href={`/trust-admin/hospitals/${hospitalUuid}/wards/add-ward`}
          >
            Add a ward for {hospitalName}
          </ActionLink>
          <p>
            <AnchorLink href={`/trust-admin/hospitals/${hospitalUuid}`}>
              {`Return to ${hospitalName}`}
            </AnchorLink>
          </p>
        </GridColumn>
      </GridRow>
    </Layout>
  );
};

export const getServerSideProps = propsWithContainer(
  verifyTrustAdminToken(async ({ container, params, authenticationToken }) => {
    const orgId = authenticationToken.trustId;
    const { wardUuid, hospitalUuid } = params;
    const {
      organisation,
      error: organisationError,
    } = await container.getRetrieveOrganisationById()(orgId);

    const {
      department,
      error: departmentError,
    } = await container.getRetrieveDepartmentByUuid()(wardUuid);

    const {
      facility,
      error: facilityError,
    } = await container.getRetrieveFacilityByUuid()(hospitalUuid);

    return {
      props: {
        error: organisationError || departmentError || facilityError,
        name: department.name,
        hospitalName: facility.name,
        hospitalUuid,
        organisation,
      },
    };
  })
);

export default EditAWardSuccess;