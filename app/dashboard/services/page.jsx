"use client";

import Loading from "@/components/MVui/defaultLoading";
import Title from "@/components/MVui/title";
import FilterServices from "@/components/forms/services/FilterServices";
import ServicesTable from "@/components/tables/ServicesTable";
import { getServices } from "@/lib/getData";
import { Pagination, PaginationItem } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect,  useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { SnackbarProvider, enqueueSnackbar } from "notistack";

function page({ searchParams }) {
  const session = useSession();
  const { sortBy, filterBy, page, search, adminId } = searchParams;
  const [filterParams, setFilterParams] = useState({
    sortBy,
    filterBy,
    search,
    adminId,
  });
  const [pageNumber, setPageNumber] = useState(page);
  const router = useRouter();
  const [servicePerPage, setServicePerPage] = useState(15);
  const [runUseEffect, setRunUseEffect] = useState(true);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState();

  useEffect(() => {
    if (session.status == "loading") return;
    (async () => {
      setServices(
        await getServices({
          sortBy: filterParams.sortBy,
          filterBy: filterParams.filterBy,
          page: pageNumber,
          search: filterParams.search,
          adminId:
            session.data?.user.grade != 1 || typeof Number(adminId) != "number"
              ? session.data?.user.id
              : Number(filterParams.adminId),
          servicePerPage,
        }),
      );
      setLoading(false);
    })();
  }, [session.status, runUseEffect, pageNumber]);
  function updateServices() {
    setLoading(true);
    setTimeout(() => {
      setRunUseEffect((a) => !a);
    }, 150);
  }
  function paginationChange(event, value) {
    const url = new URL(
      window.location.protocol + window.location.host + window.location.search,
    );
    url.searchParams.set("page", value);
    router.replace("services" + url.search);
    setPageNumber(value);
    // updateServices();
  }
  function sendSnackBar(message, variant) {
    enqueueSnackbar(message, {
      variant,
    });
  }
  return (
    <>
      <SnackbarProvider
        autoHideDuration={5000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      />
      <FilterServices
        defaultSearch={search}
        updateServices={updateServices}
        sendSnackBar={sendSnackBar}
        setFilterParams={setFilterParams}
      />
      <Title>سرویس ها</Title>
      {loading || session.status == "loading" ? (
        <Loading />
      ) : (
        <>
          {services.count == 0 ? (
            <div className="mt-4 flex justify-center ">سرویسی یافت نشد :( </div>
          ) : (
            <>
              <ServicesTable
                services={services.list}
                page={page || 1}
                servicePerPage={servicePerPage}
              />
              <div className="mt-3 flex flex-col items-center gap-2">
                {Math.ceil(services.count / servicePerPage) <= 1 ? null : (
                  <Pagination
                    size="small"
                    variant="outlined"
                    shape="rounded"
                    count={Math.ceil(services.count / servicePerPage)}
                    defaultPage={Number(pageNumber) || 1}
                    siblingCount={1}
                    boundaryCount={1}
                    onChange={paginationChange}
                    renderItem={(item) => (
                      <PaginationItem
                        slots={{
                          previous: ArrowForwardIcon,
                          next: ArrowBackIcon,
                        }}
                        {...item}
                      />
                    )}
                  />
                )}
                <span className="text-xs">{services.count} سرویس یافت شد.</span>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default page;
