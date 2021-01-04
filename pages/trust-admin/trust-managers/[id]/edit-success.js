import React from "react";
import Error from "next/error";
import Layout from "../../../../src/components/Layout";
import ActionLink from "../../../../src/components/ActionLink";
import TrustAdminHeading from "../../../../src/components/TrustAdminHeading";
import PanelSuccess from "../../../../src/components/PanelSuccess";
import propsWithContainer from "../../../../src/middleware/propsWithContainer";
import verifyTrustAdminToken from "../../../../src/usecases/verifyTrustAdminToken";
import { GridRow, GridColumn } from "../../../../src/components/Grid";
import { TRUST_ADMIN } from "../../../../src/helpers/userTypes";

const EditATrustManagerSuccess = ({ error, trustManager, trust }) => {
  if (error) {
    return <Error />;
  }

  return (
    <Layout
      title={`${trustManager.email} has been updated`}
      showNavigationBar={true}
      showNavigationBarForType={TRUST_ADMIN}
    >
      <TrustAdminHeading
        trustName={`${trust.name}`}
        subHeading="Trust Managers"
      />
      <GridRow>
        <GridColumn width="two-thirds">
          <PanelSuccess name={`${trustManager.email}`} action={`updated`} />
          <h2>What happens next</h2>

          <ActionLink href="/trust-admin/trust-managers">
            Return to Trust Managers
          </ActionLink>
        </GridColumn>
      </GridRow>
    </Layout>
  );
};

export const getServerSideProps = propsWithContainer(
  verifyTrustAdminToken(async ({ container, query, authenticationToken }) => {
    const trustResponse = await container.getRetrieveTrustById()(
      authenticationToken.trustId
    );
    const trustManagerId = query.id;
    /*** Trust Manager Array needs to swapped out with info from db once available *****/
    const trustManagers = [
      {
        id: "1",
        email: "abc@nhs.co.uk",
        status: "active",
      },
      {
        id: "2",
        email: "def@nhs.co.uk",
        status: "active",
      },
      {
        id: "3",
        email: "ghi@nhs.co.uk",
        status: "active",
      },
    ];
    const trustManager = trustManagers?.find(
      (manager) => manager.id === trustManagerId
    );
    return {
      props: {
        trust: { name: trustResponse.trust?.name },
        trustManager,
      },
    };
  })
);

export default EditATrustManagerSuccess;