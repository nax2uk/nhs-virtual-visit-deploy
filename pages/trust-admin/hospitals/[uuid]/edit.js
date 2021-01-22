import React, { useState } from "react";
import Error from "next/error";
import Router from "next/router";
import propsWithContainer from "../../../../src/middleware/propsWithContainer";
import verifyTrustAdminToken from "../../../../src/usecases/verifyTrustAdminToken";
import { GridRow, GridColumn } from "../../../../src/components/Grid";
import Layout from "../../../../src/components/Layout";
import { TRUST_ADMIN } from "../../../../src/helpers/userTypes";
import EditHospitalForm from "../../../../src/components/HospitalForm";
import ErrorSummary from "../../../../src/components/ErrorSummary";
import TrustAdminHeading from "../../../../src/components/TrustAdminHeading";

const EditHospital = ({ organisation, hospital, error }) => {
  if (error) {
    return <Error err={error} />;
  }

  const [errors, setErrors] = useState([]);

  const submit = async (payload) => {
    payload.uuid = hospital.uuid;
    try {
      const response = await fetch("/api/update-a-hospital", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(response.status);
      }

      const json = await response.json();

      Router.push(
        "/trust-admin/hospitals/[uuid]/edit-success",
        `/trust-admin/hospitals/${json.facilityUuid}/edit-success`
      );

      return true;
    } catch (e) {
      const onSubmitErrors = [
        {
          id: "hospital-update-error",
          message: "There was a problem saving your changes",
        },
      ];
      setErrors(onSubmitErrors);
    }

    return false;
  };

  return (
    <Layout
      title="Edit a hospital"
      hasErrors={errors.length != 0}
      showNavigationBar={true}
      showNavigationBarForType={TRUST_ADMIN}
    >
      <TrustAdminHeading trustName={organisation.name} subHeading="Hospitals" />

      <GridRow>
        <GridColumn width="two-thirds">
          <ErrorSummary errors={errors} />
          <EditHospitalForm
            errors={errors}
            setErrors={setErrors}
            hospital={hospital}
            submit={submit}
          />
        </GridColumn>
      </GridRow>
    </Layout>
  );
};

export const getServerSideProps = propsWithContainer(
  verifyTrustAdminToken(async ({ authenticationToken, container, query }) => {
    const { uuid: facilityUuid } = query;
    const orgId = authenticationToken.trustId;
    const {
      organisation,
      error: organisationError,
    } = await container.getRetrieveOrganisationById()(orgId);
    const {
      facility,
      error: facilityError,
    } = await container.getRetrieveFacilityByUuid()(facilityUuid);
    console.log(facility);
    return {
      props: {
        hospital: facility,
        error: facilityError || organisationError,
        organisation,
      },
    };
  })
);

export default EditHospital;
