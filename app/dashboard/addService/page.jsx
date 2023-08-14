"use client";
import Title from "@/components/MVui/title";
import Loading from "@/components/MVui/defaultLoading";
import { getAllowedServiceTypes } from "@/lib/getData";
import { MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import FormContainer from "@/components/MVui/formContainer";
import AddServiceForm from "@/components/forms/services/AddServiceForm";
function AddService() {
  const [loading, setLoading] = useState(true);
  const [serviceTypes, setServiceTypes] = useState();
  const [selectedServiceType, setSelectedServiceType] = useState("");
  useEffect(() => {
    (async () => {
      setServiceTypes(await getAllowedServiceTypes());
      setLoading(false);
    })();
  }, []);
  if (loading) return <Loading />;
  return (
    <>
      <Title>افزودن سرویس</Title>
      <FormContainer>
        <TextField
          id="serviceType"
          label="نوع سرویس"
          value={selectedServiceType}
          onChange={(e) => {
            setSelectedServiceType(e.target.value);
          }}
          select
        >
          {serviceTypes.map((serviceType) => {
            return (
              <MenuItem key={serviceType.id} value={serviceType}>
                {serviceType.name}
              </MenuItem>
            );
          })}
        </TextField>
        {!selectedServiceType ? (
          <span className="text-gray-300">نوع سرویس را انتخاب کنید.</span>
        ) : (
          <AddServiceForm serviceTypeId={selectedServiceType.id} />
        )}
      </FormContainer>
    </>
  );
}

export default AddService;
