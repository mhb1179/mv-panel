"use client";
import { useEffect, useState } from "react";
import Loading from "@/components/MVui/defaultLoading";
import ServiceTypesTable from "@/components/tables/ServiceTypesTable";
import { getServiceTypes } from "@/lib/getData";
import AddServiceTypes from "@/components/forms/serviceTypes/AddServiceType";
export default function ServiceTypes() {
  const [loading, setLoading] = useState(true);
  const [serviceTypes, setServiceTypes] = useState();
  const [runUseEffect, setRunUseEffect] = useState(true);
  useEffect(() => {
    (async () => {
      setServiceTypes(await getServiceTypes());
      setLoading(false);
    })();
  }, [runUseEffect]);
  function updateServiceTypesList() {
    setRunUseEffect((a) => !a);
  }
  if (loading) return <Loading />;
  return (
    <>
      <ServiceTypesTable serviceTypes={serviceTypes.list} />
      <div className="my-4"></div>
      <AddServiceTypes updateServiceTypesList={updateServiceTypesList} />
    </>
  );
}
